#!/usr/bin/env python3
"""
PurrfectMatch - Cat Adoption Matching System
A CLI application that uses real APIs to match users with adoptable cats.
"""

import requests
import sqlite3
import json
import time
import os
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

try:
    from dotenv import load_dotenv
    # Load environment variables
    load_dotenv()
except ImportError:
    print("Note: python-dotenv not installed. Using system environment variables.")

# =============================================================================
# DATA MODELS
# =============================================================================

class HomeType(Enum):
    APARTMENT = "apartment"
    HOUSE_WITH_YARD = "house_with_yard"
    FARM_RURAL = "farm_rural"

class ExperienceLevel(Enum):
    FIRST_TIME = "first_time"
    SOME_EXPERIENCE = "some_experience"
    VERY_EXPERIENCED = "very_experienced"

@dataclass
class UserProfile:
    """User profile from compatibility quiz"""
    home_type: HomeType = HomeType.APARTMENT
    hours_away: int = 8
    activity_level: int = 5  # 1-10 scale
    experience: ExperienceLevel = ExperienceLevel.FIRST_TIME
    allergies: bool = False
    desired_traits: List[str] = None
    zip_code: str = ""
    user_id: Optional[str] = None
    
    def __post_init__(self):
        if self.desired_traits is None:
            self.desired_traits = []

@dataclass
class CatProfile:
    """Cat profile from Petfinder API"""
    petfinder_id: str
    name: str
    age: str
    breeds: List[str]
    size: str
    gender: str
    description: str
    photos: List[str]
    contact_email: str
    contact_phone: str
    shelter_name: str
    distance: float = 0.0
    
    # Derived compatibility attributes
    energy_level: int = 5  # 1-10, derived from description
    independence: int = 5  # 1-10, derived from description/breed
    personality_traits: List[str] = None
    temperament: str = "moderate"  # easy, moderate, challenging
    
    def __post_init__(self):
        if self.personality_traits is None:
            self.personality_traits = []

@dataclass
class BreedInfo:
    """Breed info from TheCatAPI"""
    name: str
    temperament: List[str]
    origin: str
    description: str
    life_span: str
    hypoallergenic: int = 0  # 0 or 1
    energy_level: int = 3  # 1-5 scale from API
    affection_level: int = 3  # 1-5 scale from API

@dataclass
class CompatibilityScore:
    """Compatibility scoring result"""
    cat_id: str
    total_score: int  # 0-100
    lifestyle_score: int
    experience_score: int
    personality_score: int
    reasons: List[str]

# =============================================================================
# API CLIENTS
# =============================================================================

class TheCatAPIClient:
    """Client for TheCatAPI to get breed information"""
    
    def __init__(self, api_key: str = None):
        self.base_url = "https://api.thecatapi.com/v1"
        self.api_key = api_key
        self.headers = {}
        if api_key:
            self.headers['x-api-key'] = api_key
    
    def get_breeds(self) -> List[BreedInfo]:
        """Get all cat breeds with their characteristics"""
        try:
            response = requests.get(f"{self.base_url}/breeds", headers=self.headers)
            response.raise_for_status()
            
            breeds = []
            for breed_data in response.json():
                temperament = breed_data.get('temperament', '').split(', ') if breed_data.get('temperament') else []
                
                breed = BreedInfo(
                    name=breed_data.get('name', 'Unknown'),
                    temperament=temperament,
                    origin=breed_data.get('origin', 'Unknown'),
                    description=breed_data.get('description', ''),
                    life_span=breed_data.get('life_span', 'Unknown'),
                    hypoallergenic=breed_data.get('hypoallergenic', 0),
                    energy_level=breed_data.get('energy_level', 3),
                    affection_level=breed_data.get('affection_level', 3)
                )
                breeds.append(breed)
            
            print(f"Retrieved {len(breeds)} cat breeds from TheCatAPI")
            return breeds
            
        except Exception as e:
            print(f"ERROR: Error fetching breeds from TheCatAPI: {e}")
            return []
    
    def get_breed_by_name(self, breed_name: str) -> Optional[BreedInfo]:
        """Get specific breed information"""
        breeds = self.get_breeds()
        for breed in breeds:
            if breed.name.lower() == breed_name.lower():
                return breed
        return None

class PetfinderAPIClient:
    """Client for Petfinder API to get adoptable cats"""
    
    def __init__(self, api_key: str, secret: str):
        self.api_key = api_key
        self.secret = secret
        self.base_url = "https://api.petfinder.com/v2"
        self.access_token = None
        self.token_expires = 0
    
    def _get_access_token(self):
        """Get OAuth2 access token"""
        if self.access_token and time.time() < self.token_expires:
            return self.access_token
        
        try:
            response = requests.post(f"{self.base_url}/oauth2/token", data={
                'grant_type': 'client_credentials',
                'client_id': self.api_key,
                'client_secret': self.secret
            })
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            self.token_expires = time.time() + token_data['expires_in'] - 60  # Refresh 1 min early
            
            return self.access_token
            
        except requests.RequestException as e:
            print(f"ERROR: Error getting Petfinder access token: {e}")
            return None
    
    def search_cats(self, location: str, limit: int = 20) -> List[CatProfile]:
        """Search for adoptable cats near location"""
        token = self._get_access_token()
        if not token:
            return []
        
        headers = {'Authorization': f'Bearer {token}'}
        params = {
            'type': 'cat',
            'location': location,
            'limit': limit,
            'status': 'adoptable'
        }
        
        try:
            response = requests.get(f"{self.base_url}/animals", headers=headers, params=params)
            response.raise_for_status()
            
            cats = []
            data = response.json()
            
            # Dictionary to track cats we've already processed
            seen_cats = {}
            
            for animal in data.get('animals', []):
                cat_id = str(animal.get('id', ''))
                
                # Skip if we've already processed this cat
                if cat_id in seen_cats:
                    # If this record has more complete information, update the existing one
                    existing_cat = seen_cats[cat_id]
                    
                    # Check if current record has photos and existing doesn't
                    current_photos = [photo['large'] for photo in animal.get('photos', []) if 'large' in photo]
                    if current_photos and not existing_cat.photos:
                        existing_cat.photos = current_photos
                    
                    # Check if current record has contact info and existing doesn't
                    contact = animal.get('contact', {})
                    if contact.get('email') and not existing_cat.contact_email:
                        existing_cat.contact_email = contact.get('email', '')
                    if contact.get('phone') and not existing_cat.contact_phone:
                        existing_cat.contact_phone = contact.get('phone', '')
                    
                    continue
                
                # Extract photos
                photos = [photo['large'] for photo in animal.get('photos', []) if 'large' in photo]
                
                # Extract breeds
                breeds = []
                if animal.get('breeds'):
                    if animal['breeds'].get('primary'):
                        breeds.append(animal['breeds']['primary'])
                    if animal['breeds'].get('secondary'):
                        breeds.append(animal['breeds']['secondary'])
                
                # Extract contact info
                contact = animal.get('contact', {})
                
                cat = CatProfile(
                    petfinder_id=cat_id,
                    name=animal.get('name', 'Unknown'),
                    age=animal.get('age', 'Unknown'),
                    breeds=breeds,
                    size=animal.get('size', 'Unknown'),
                    gender=animal.get('gender', 'Unknown'),
                    description=animal.get('description', ''),
                    photos=photos,
                    contact_email=contact.get('email', ''),
                    contact_phone=contact.get('phone', ''),
                    shelter_name=animal.get('organization_id', 'Unknown Shelter'),
                    distance=animal.get('distance', 0.0)
                )
                
                # Derive personality traits from description and breeds
                self._enhance_cat_profile(cat)
                
                # Store in our tracking dictionary and add to results
                seen_cats[cat_id] = cat
                cats.append(cat)
            
            print(f"Found {len(cats)} unique adoptable cats near {location}")
            return cats
            
        except requests.RequestException as e:
            print(f"ERROR: Error searching Petfinder: {e}")
            return []

    
    def _enhance_cat_profile(self, cat: CatProfile):
        """Enhance cat profile with derived personality traits"""
        description = cat.description.lower() if cat.description else ""
        
        # Analyze description for personality traits
        traits = []
        if any(word in description for word in ['calm', 'quiet', 'gentle', 'peaceful']):
            traits.append('calm')
        if any(word in description for word in ['playful', 'active', 'energetic', 'loves to play']):
            traits.append('playful')
        if any(word in description for word in ['independent', 'self-sufficient']):
            traits.append('independent')
        if any(word in description for word in ['affectionate', 'loving', 'cuddly', 'lap cat']):
            traits.append('affectionate')
        if any(word in description for word in ['social', 'friendly', 'outgoing']):
            traits.append('social')
        if any(word in description for word in ['shy', 'timid', 'reserved']):
            traits.append('shy')
        
        cat.personality_traits = traits
        
        # Estimate energy level
        if any(word in description for word in ['high energy', 'very active', 'energetic']):
            cat.energy_level = 8
        elif any(word in description for word in ['playful', 'active']):
            cat.energy_level = 6
        elif any(word in description for word in ['calm', 'quiet', 'low energy']):
            cat.energy_level = 3
        else:
            cat.energy_level = 5
        
        # Estimate independence
        if any(word in description for word in ['independent', 'self-sufficient']):
            cat.independence = 8
        elif any(word in description for word in ['needs attention', 'very social']):
            cat.independence = 3
        else:
            cat.independence = 6
        
        # Estimate temperament
        if any(word in description for word in ['easy going', 'gentle', 'calm']):
            cat.temperament = 'easy'
        elif any(word in description for word in ['special needs', 'requires', 'challenging']):
            cat.temperament = 'challenging'
        else:
            cat.temperament = 'moderate'

# =============================================================================
# COMPATIBILITY ALGORITHM
# =============================================================================

class CompatibilityCalculator:
    """Calculates compatibility scores between users and cats"""
    
    def calculate_compatibility(self, user: UserProfile, cat: CatProfile, 
                              breed_info: BreedInfo = None) -> CompatibilityScore:
        """Calculate total compatibility score (0-100 points)"""
        
        lifestyle_score = self._calculate_lifestyle_score(user, cat)
        experience_score = self._calculate_experience_score(user, cat)
        personality_score = self._calculate_personality_score(user, cat, breed_info)
        
        total_score = lifestyle_score + experience_score + personality_score
        
        reasons = self._generate_reasons(user, cat, lifestyle_score, experience_score, personality_score)
        
        return CompatibilityScore(
            cat_id=cat.petfinder_id,
            total_score=total_score,
            lifestyle_score=lifestyle_score,
            experience_score=experience_score,
            personality_score=personality_score,
            reasons=reasons
        )
    
    def _calculate_lifestyle_score(self, user: UserProfile, cat: CatProfile) -> int:
        """Calculate lifestyle compatibility (0-40 points)"""
        score = 0
        
        # Work schedule compatibility (20 points)
        if user.hours_away <= 4:
            score += 20
        elif user.hours_away <= 8:
            if cat.independence >= 7:
                score += 20
            else:
                score += 12
        else:  # Away 8+ hours
            if cat.independence >= 8:
                score += 15
            else:
                score += 5
        
        # Living space compatibility (10 points)
        if user.home_type == HomeType.APARTMENT:
            if cat.energy_level <= 5:
                score += 10
            elif cat.energy_level <= 7:
                score += 6
            else:
                score += 2
        else:  # House or farm
            score += 10
        
        # Activity level match (10 points)
        activity_diff = abs(user.activity_level - cat.energy_level)
        score += max(0, 10 - activity_diff)
        
        return min(score, 40)
    
    def _calculate_experience_score(self, user: UserProfile, cat: CatProfile) -> int:
        """Calculate experience compatibility (0-30 points)"""
        if user.experience == ExperienceLevel.FIRST_TIME:
            if cat.temperament == "easy":
                return 30
            elif cat.temperament == "moderate":
                return 20
            else:
                return 10
        elif user.experience == ExperienceLevel.SOME_EXPERIENCE:
            if cat.temperament in ["easy", "moderate"]:
                return 30
            else:
                return 25
        else:  # Very experienced
            return 30
    
    def _calculate_personality_score(self, user: UserProfile, cat: CatProfile, 
                                   breed_info: BreedInfo = None) -> int:
        """Calculate personality compatibility (0-30 points)"""
        score = 15  # Base score
        
        # User desired traits vs cat traits
        if user.desired_traits and cat.personality_traits:
            matches = len(set(user.desired_traits) & set(cat.personality_traits))
            trait_bonus = min(matches * 5, 15)
            score += trait_bonus
        
        # Allergy consideration
        if user.allergies and breed_info:
            if breed_info.hypoallergenic:
                score += 0  # No penalty
            else:
                score -= 10  # Penalty for non-hypoallergenic
        
        return max(0, min(score, 30))
    
    def _generate_reasons(self, user: UserProfile, cat: CatProfile, 
                         lifestyle: int, experience: int, personality: int) -> List[str]:
        """Generate explanatory reasons for the compatibility score"""
        reasons = []
        
        if lifestyle >= 35:
            reasons.append("Excellent lifestyle match for your schedule and home")
        elif lifestyle >= 25:
            reasons.append("Good lifestyle compatibility")
        else:
            reasons.append("Some lifestyle adjustments may be needed")
        
        if experience >= 25:
            reasons.append("Perfect match for your experience level")
        elif experience >= 20:
            reasons.append("Suitable for your cat experience")
        else:
            reasons.append("May be challenging for your current experience")
        
        if personality >= 25:
            reasons.append("Strong personality and trait compatibility")
        elif personality >= 15:
            reasons.append("Good personality match")
        else:
            reasons.append("Some personality differences to consider")
        
        return reasons

# =============================================================================
# DATABASE
# =============================================================================

class Database:
    """Simple SQLite database for storing user profiles and matches"""
    
    def __init__(self, db_path: str = "purrfect_match.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT UNIQUE,
                    home_type TEXT,
                    hours_away INTEGER,
                    activity_level INTEGER,
                    experience TEXT,
                    allergies BOOLEAN,
                    desired_traits TEXT,
                    zip_code TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS matches (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    cat_id TEXT,
                    cat_name TEXT,
                    total_score INTEGER,
                    lifestyle_score INTEGER,
                    experience_score INTEGER,
                    personality_score INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            ''')
    
    def save_user(self, user: UserProfile) -> str:
        """Save user profile and return user_id"""
        user_id = f"user_{user.zip_code}_{int(time.time())}"
        user.user_id = user_id
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO users 
                (user_id, home_type, hours_away, activity_level, experience, allergies, desired_traits, zip_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, user.home_type.value, user.hours_away, user.activity_level,
                user.experience.value, user.allergies, json.dumps(user.desired_traits), user.zip_code
            ))
        
        return user_id
    
    def save_match(self, user_id: str, cat: CatProfile, score: CompatibilityScore):
        """Save a compatibility match result"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO matches 
                (user_id, cat_id, cat_name, total_score, lifestyle_score, experience_score, personality_score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, cat.petfinder_id, cat.name, score.total_score,
                score.lifestyle_score, score.experience_score, score.personality_score
            ))

# =============================================================================
# CLI APPLICATION
# =============================================================================

class PurrfectMatchApp:
    """Main CLI application"""
    
    def __init__(self):
        self.db = Database()
        self.calculator = CompatibilityCalculator()
        
        # Initialize API clients (you'll need to set your API keys)
        self.cat_api = TheCatAPIClient()  # Works without API key for basic features
        self.petfinder_api = None  # Will be initialized with API keys if provided
    
    def set_api_keys(self, petfinder_key: str = None, petfinder_secret: str = None, cat_api_key: str = None):
        """Set API keys for external services"""
        if petfinder_key and petfinder_secret:
            self.petfinder_api = PetfinderAPIClient(petfinder_key, petfinder_secret)
        if cat_api_key:
            self.cat_api = TheCatAPIClient(cat_api_key)
    
    def take_quiz(self) -> UserProfile:
        """Take the compatibility quiz"""
        print("\nWelcome to PurrfectMatch!")
        print("Let's find your perfect cat companion!")
        print("-" * 50)
        
        # Home type
        print("\nWhat's your living situation?")
        print("1. Apartment")
        print("2. House with yard")
        print("3. Farm/Rural")
        home_choice = int(input("> "))
        home_type = [HomeType.APARTMENT, HomeType.HOUSE_WITH_YARD, HomeType.FARM_RURAL][home_choice - 1]
        
        # Work schedule
        print("\nHours away from home daily?")
        print("1. Less than 4 hours")
        print("2. 4-8 hours") 
        print("3. More than 8 hours")
        work_choice = int(input("> "))
        hours_away = [3, 6, 10][work_choice - 1]
        
        # Activity level
        print("\nActivity level (1-10, 10=very active):")
        activity_level = int(input("> "))
        
        # Experience
        print("\nCat experience?")
        print("1. First-time owner")
        print("2. Some experience")
        print("3. Very experienced")
        exp_choice = int(input("> "))
        experience = [ExperienceLevel.FIRST_TIME, ExperienceLevel.SOME_EXPERIENCE, ExperienceLevel.VERY_EXPERIENCED][exp_choice - 1]
        
        # Allergies
        allergies = input("\nAllergies? (y/n): ").lower().startswith('y')
        
        # Desired traits
        print("\nDesired traits (comma-separated):")
        print("Options: calm, playful, independent, affectionate, social, shy")
        traits_input = input("> ")
        desired_traits = [t.strip().lower() for t in traits_input.split(",") if t.strip()]
        
        # ZIP code
        zip_code = input("\nZIP code: ")
        
        return UserProfile(
            home_type=home_type,
            hours_away=hours_away,
            activity_level=activity_level,
            experience=experience,
            allergies=allergies,
            desired_traits=desired_traits,
            zip_code=zip_code
        )
    
    def find_matches(self, user: UserProfile) -> List[tuple]:
        """Find compatible cats using real API data"""
        print(f"\nSearching for cats near {user.zip_code}...")
        
        # Get cats from Petfinder
        if self.petfinder_api:
            cats = self.petfinder_api.search_cats(user.zip_code, limit=20)
        else:
            print("WARNING: Petfinder API not configured - using demo mode")
            return []
        
        if not cats:
            print("ERROR: No cats found. Check your location or API configuration.")
            return []
        
        # Get breed information
        breed_cache = {}
        
        matches = []
        for cat in cats:
            # Get breed info for first breed
            breed_info = None
            if cat.breeds:
                breed_name = cat.breeds[0]
                if breed_name not in breed_cache:
                    breed_cache[breed_name] = self.cat_api.get_breed_by_name(breed_name)
                breed_info = breed_cache[breed_name]
            
            # Calculate compatibility
            score = self.calculator.calculate_compatibility(user, cat, breed_info)
            matches.append((cat, score, breed_info))
        
        # Sort by compatibility score
        matches.sort(key=lambda x: x[1].total_score, reverse=True)
        return matches
    
    def display_matches(self, matches: List[tuple]):
        """Display compatibility matches"""
        print(f"\nYOUR TOP MATCHES")
        print("=" * 60)
        
        for i, (cat, score, breed_info) in enumerate(matches[:5], 1):
            rating = "EXCELLENT" if score.total_score >= 80 else "GOOD" if score.total_score >= 60 else "FAIR"
            
            print(f"\n{i}. {cat.name} - {score.total_score}% Compatible ({rating})")
            print(f"   Location: {cat.shelter_name} ({cat.distance:.1f} miles)")
            print(f"   Details: {', '.join(cat.breeds)} • {cat.age} • {cat.gender}")
            print(f"   Scores: Lifestyle: {score.lifestyle_score}/40 | Experience: {score.experience_score}/30 | Personality: {score.personality_score}/30")
            
            if cat.photos:
                print(f"   Photo: {cat.photos[0]}")
            
            if cat.contact_email:
                print(f"   Contact: {cat.contact_email}")
            
            print("   Why this match:")
            for reason in score.reasons:
                print(f"      • {reason}")
    
    def run(self):
        """Run the main application"""
        try:
            # Take quiz
            user = self.take_quiz()
            
            # Save user
            user_id = self.db.save_user(user)
            print(f"\nProfile saved! ID: {user_id}")
            
            # Find and display matches
            matches = self.find_matches(user)
            
            if matches:
                self.display_matches(matches)
                
                # Save top matches
                for cat, score, _ in matches[:5]:
                    self.db.save_match(user_id, cat, score)
                
                print(f"\nSaved {min(5, len(matches))} matches to database!")
            
            print("\nThanks for using PurrfectMatch!")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
        except Exception as e:
            print(f"\nError: {e}")

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    app = PurrfectMatchApp()
    
    # Load API keys from environment
    cat_api_key = os.getenv('CAT_API_KEY')
    petfinder_key = os.getenv('PETFINDER_API_KEY')
    petfinder_secret = os.getenv('PETFINDER_SECRET')
    
    # Set API keys if available
    if petfinder_key and petfinder_secret:
        print("Loading API keys from environment...")
        app.set_api_keys(
            petfinder_key=petfinder_key,
            petfinder_secret=petfinder_secret,
            cat_api_key=cat_api_key
        )
    else:
        print("WARNING: Petfinder API keys not found in environment")
    
    app.run() 