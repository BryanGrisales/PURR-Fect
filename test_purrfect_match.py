#!/usr/bin/env python3
"""
Unit tests for PurrfectMatch - Cat Adoption Matching System
Tests the core functionality including API integration, compatibility scoring, and database operations.
"""

import pytest
import tempfile
import os
from unittest.mock import Mock, patch
from purrfect_match import (
    UserProfile, CatProfile, BreedInfo, CompatibilityScore,
    HomeType, ExperienceLevel,
    TheCatAPIClient, PetfinderAPIClient, CompatibilityCalculator, Database
)

class TestUserProfile:
    """Test UserProfile data model"""
    
    def test_user_profile_defaults(self):
        """Test UserProfile with default values"""
        user = UserProfile()
        assert user.home_type == HomeType.APARTMENT
        assert user.hours_away == 8
        assert user.activity_level == 5
        assert user.experience == ExperienceLevel.FIRST_TIME
        assert user.allergies == False
        assert user.desired_traits == []
        assert user.zip_code == ""

    def test_user_profile_with_values(self):
        """Test UserProfile with custom values"""
        user = UserProfile(
            home_type=HomeType.HOUSE_WITH_YARD,
            hours_away=4,
            activity_level=8,
            experience=ExperienceLevel.VERY_EXPERIENCED,
            allergies=True,
            desired_traits=["calm", "playful"],
            zip_code="12345"
        )
        assert user.home_type == HomeType.HOUSE_WITH_YARD
        assert user.hours_away == 4
        assert user.activity_level == 8
        assert user.experience == ExperienceLevel.VERY_EXPERIENCED
        assert user.allergies == True
        assert user.desired_traits == ["calm", "playful"]
        assert user.zip_code == "12345"

class TestCatProfile:
    """Test CatProfile data model"""
    
    def test_cat_profile_creation(self):
        """Test creating a CatProfile"""
        cat = CatProfile(
            petfinder_id="12345",
            name="Whiskers",
            age="Adult",
            breeds=["Domestic Shorthair"],
            size="Medium",
            gender="Male",
            description="A calm and friendly cat",
            photos=["http://example.com/photo.jpg"],
            contact_email="shelter@example.com",
            contact_phone="555-1234",
            shelter_name="Happy Paws Shelter"
        )
        
        assert cat.petfinder_id == "12345"
        assert cat.name == "Whiskers"
        assert cat.breeds == ["Domestic Shorthair"]
        assert cat.personality_traits == []  # Default empty list
        assert cat.energy_level == 5  # Default
        assert cat.independence == 5  # Default

class TestTheCatAPIClient:
    """Test TheCatAPI client"""
    
    @patch('purrfect_match.requests.get')
    def test_get_breeds_success(self, mock_get):
        """Test successful breed retrieval"""
        mock_response = Mock()
        mock_response.json.return_value = [
            {
                'name': 'Siamese',
                'temperament': 'Active, Agile, Clever, Sociable',
                'origin': 'Thailand',
                'description': 'The Siamese cat is one of the first distinctly recognized breeds.',
                'life_span': '14 - 16',
                'hypoallergenic': 0,
                'energy_level': 5,
                'affection_level': 5
            }
        ]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        client = TheCatAPIClient()
        breeds = client.get_breeds()
        
        assert len(breeds) == 1
        assert breeds[0].name == 'Siamese'
        assert breeds[0].temperament == ['Active', 'Agile', 'Clever', 'Sociable']
        assert breeds[0].energy_level == 5

    @patch('purrfect_match.requests.get')
    def test_get_breeds_failure(self, mock_get):
        """Test API failure handling"""
        mock_get.side_effect = Exception("API Error")
        client = TheCatAPIClient()
        breeds = client.get_breeds()
        assert breeds == []

    @patch('purrfect_match.requests.get')
    def test_get_breed_by_name(self, mock_get):
        """Test getting specific breed by name"""
        mock_response = Mock()
        mock_response.json.return_value = [
            {'name': 'Persian', 'temperament': 'Affectionate, Loyal', 'origin': 'Iran'},
            {'name': 'Maine Coon', 'temperament': 'Gentle, Friendly', 'origin': 'United States'}
        ]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        client = TheCatAPIClient()
        breed = client.get_breed_by_name('Persian')
        
        assert breed is not None
        assert breed.name == 'Persian'
        assert breed.temperament == ['Affectionate', 'Loyal']

class TestPetfinderAPIClient:
    """Test Petfinder API client"""
    
    @patch('purrfect_match.requests.post')
    def test_get_access_token_success(self, mock_post):
        """Test successful token retrieval"""
        mock_response = Mock()
        mock_response.json.return_value = {
            'access_token': 'test_token_123',
            'expires_in': 3600
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        client = PetfinderAPIClient('test_key', 'test_secret')
        token = client._get_access_token()
        
        assert token == 'test_token_123'
        assert client.access_token == 'test_token_123'

    @patch('purrfect_match.requests.get')
    @patch('purrfect_match.requests.post')
    def test_search_cats_success(self, mock_post, mock_get):
        """Test successful cat search"""
        # Mock token request
        mock_post.return_value.json.return_value = {
            'access_token': 'test_token',
            'expires_in': 3600
        }
        mock_post.return_value.raise_for_status.return_value = None
        
        # Mock cat search
        mock_get.return_value.json.return_value = {
            'animals': [
                {
                    'id': 12345,
                    'name': 'Fluffy',
                    'age': 'Adult',
                    'breeds': {'primary': 'Domestic Shorthair', 'secondary': None},
                    'size': 'Medium',
                    'gender': 'Female',
                    'description': 'A calm and friendly cat who loves to play.',
                    'photos': [{'large': 'http://example.com/fluffy.jpg'}],
                    'contact': {'email': 'shelter@example.com', 'phone': '555-1234'},
                    'organization_id': 'Happy Shelter',
                    'distance': 2.5
                }
            ]
        }
        mock_get.return_value.raise_for_status.return_value = None
        
        client = PetfinderAPIClient('test_key', 'test_secret')
        cats = client.search_cats('12345')
        
        assert len(cats) == 1
        cat = cats[0]
        assert cat.name == 'Fluffy'
        assert cat.petfinder_id == '12345'
        assert cat.breeds == ['Domestic Shorthair']
        assert 'calm' in cat.personality_traits  # Should be derived from description
        assert 'playful' in cat.personality_traits

class TestCompatibilityCalculator:
    """Test compatibility scoring algorithm"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.calculator = CompatibilityCalculator()
        
        # Standard user profile
        self.user = UserProfile(
            home_type=HomeType.APARTMENT,
            hours_away=8,
            activity_level=5,
            experience=ExperienceLevel.FIRST_TIME,
            allergies=False,
            desired_traits=["calm", "independent"],
            zip_code="12345"
        )
        
        # Perfect match cat
        self.perfect_cat = CatProfile(
            petfinder_id="cat_001",
            name="Perfect",
            age="Adult",
            breeds=["Domestic Shorthair"],
            size="Medium",
            gender="Female",
            description="Calm and independent",
            photos=[],
            contact_email="test@example.com",
            contact_phone="555-1234",
            shelter_name="Test Shelter",
            energy_level=4,
            independence=8,
            personality_traits=["calm", "independent"],
            temperament="easy"
        )
        
        # Poor match cat
        self.poor_cat = CatProfile(
            petfinder_id="cat_002",
            name="Energetic",
            age="Young",
            breeds=["Bengal"],
            size="Large",
            gender="Male",
            description="Very active and demanding",
            photos=[],
            contact_email="test@example.com",
            contact_phone="555-1234",
            shelter_name="Test Shelter",
            energy_level=9,
            independence=3,
            personality_traits=["energetic", "demanding"],
            temperament="challenging"
        )

    def test_perfect_match_scoring(self):
        """Test that perfect matches score highly"""
        score = self.calculator.calculate_compatibility(self.user, self.perfect_cat)
        
        assert score.total_score >= 80, f"Perfect match should score 80+, got {score.total_score}"
        assert score.cat_id == "cat_001"
        assert len(score.reasons) > 0

    def test_poor_match_scoring(self):
        """Test that poor matches score lowly"""
        score = self.calculator.calculate_compatibility(self.user, self.poor_cat)
        
        assert score.total_score < 60, f"Poor match should score under 60, got {score.total_score}"
        assert score.cat_id == "cat_002"

    def test_lifestyle_score_calculation(self):
        """Test lifestyle scoring logic"""
        # Test apartment + low energy cat
        score = self.calculator._calculate_lifestyle_score(self.user, self.perfect_cat)
        assert score >= 30, f"Apartment + low energy should score well, got {score}"
        
        # Test apartment + high energy cat
        score = self.calculator._calculate_lifestyle_score(self.user, self.poor_cat)
        assert score < 25, f"Apartment + high energy should score poorly, got {score}"

    def test_experience_score_calculation(self):
        """Test experience level scoring"""
        # First-time owner + easy cat
        score = self.calculator._calculate_experience_score(self.user, self.perfect_cat)
        assert score == 30, f"First-time + easy cat should get 30 points, got {score}"
        
        # First-time owner + challenging cat
        score = self.calculator._calculate_experience_score(self.user, self.poor_cat)
        assert score <= 10, f"First-time + challenging cat should get ≤10 points, got {score}"

    def test_personality_score_with_trait_matching(self):
        """Test personality scoring with trait matching"""
        # User wants calm & independent, cat has calm & independent
        score = self.calculator._calculate_personality_score(self.user, self.perfect_cat)
        assert score >= 25, f"Perfect trait match should score well, got {score}"
        
        # User wants calm & independent, cat has energetic & demanding
        score = self.calculator._calculate_personality_score(self.user, self.poor_cat)
        assert score <= 20, f"No trait match should score lower, got {score}"

    def test_allergy_considerations(self):
        """Test allergy handling in personality scoring"""
        allergic_user = UserProfile(allergies=True)
        
        # Non-hypoallergenic breed
        regular_breed = BreedInfo(
            name="Persian", temperament=[], origin="Iran", 
            description="", life_span="", hypoallergenic=0
        )
        score = self.calculator._calculate_personality_score(allergic_user, self.perfect_cat, regular_breed)
        
        # Hypoallergenic breed
        hypo_breed = BreedInfo(
            name="Russian Blue", temperament=[], origin="Russia",
            description="", life_span="", hypoallergenic=1
        )
        score_hypo = self.calculator._calculate_personality_score(allergic_user, self.perfect_cat, hypo_breed)
        
        assert score_hypo >= score, "Hypoallergenic breed should score better for allergic users"

    def test_score_bounds(self):
        """Test that scores stay within expected bounds"""
        score = self.calculator.calculate_compatibility(self.user, self.perfect_cat)
        
        assert 0 <= score.total_score <= 100
        assert 0 <= score.lifestyle_score <= 40
        assert 0 <= score.experience_score <= 30
        assert 0 <= score.personality_score <= 30

class TestDatabase:
    """Test database operations"""
    
    def setup_method(self):
        """Set up test database"""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        self.db = Database(self.temp_db.name)
        
        self.test_user = UserProfile(
            home_type=HomeType.APARTMENT,
            hours_away=8,
            activity_level=5,
            experience=ExperienceLevel.FIRST_TIME,
            allergies=False,
            desired_traits=["calm"],
            zip_code="12345"
        )

    def teardown_method(self):
        """Clean up test database"""
        try:
            os.unlink(self.temp_db.name)
        except OSError:
            pass

    def test_save_user(self):
        """Test saving user profile"""
        user_id = self.db.save_user(self.test_user)
        
        assert user_id is not None
        assert user_id.startswith("user_12345_")
        assert self.test_user.user_id == user_id

    def test_save_match(self):
        """Test saving match result"""
        user_id = self.db.save_user(self.test_user)
        
        cat = CatProfile(
            petfinder_id="cat_123",
            name="Test Cat",
            age="Adult",
            breeds=["Domestic"],
            size="Medium",
            gender="Female",
            description="Test cat",
            photos=[],
            contact_email="test@example.com",
            contact_phone="555-1234",
            shelter_name="Test Shelter"
        )
        
        score = CompatibilityScore(
            cat_id="cat_123",
            total_score=85,
            lifestyle_score=35,
            experience_score=25,
            personality_score=25,
            reasons=["Good match"]
        )
        
        # Should not raise any exceptions
        self.db.save_match(user_id, cat, score)

class TestAPIIntegration:
    """Integration tests for API functionality"""
    
    def test_cat_profile_enhancement(self):
        """Test that cat profiles are enhanced with personality traits"""
        client = PetfinderAPIClient("fake_key", "fake_secret")
        
        cat = CatProfile(
            petfinder_id="test",
            name="Test",
            age="Adult",
            breeds=[],
            size="Medium",
            gender="Female",
            description="This cat is very calm and loves to play. She is quite independent.",
            photos=[],
            contact_email="",
            contact_phone="",
            shelter_name=""
        )
        
        client._enhance_cat_profile(cat)
        
        assert "calm" in cat.personality_traits
        assert "playful" in cat.personality_traits
        assert "independent" in cat.personality_traits
        assert cat.energy_level > 0
        assert cat.independence > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 