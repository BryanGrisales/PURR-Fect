# PurrfectMatch - Cat Adoption Matching System

A CLI application that uses real APIs to match users with adoptable cats based on lifestyle compatibility.

## Problem & Solution

**Problem**: 3.2 million cats enter U.S. shelters annually, 530,000 are euthanized. Many failed adoptions occur due to poor lifestyle/personality matching.

**Solution**: PurrfectMatch uses real shelter data and breed information to create compatibility scores based on lifestyle factors, not just appearance.

## API Integrations

- **TheCatAPI** - Gets breed characteristics, temperament, energy levels
- **Petfinder API** - Pulls real adoptable cats from local shelters

## Setup

### Install Dependencies
```bash
pip install requests pytest
```

### Get API Keys
- Petfinder: Register at https://www.petfinder.com/developers/
- TheCatAPI: Get key at https://thecatapi.com/ (optional)

### Configure API Keys
Edit `purrfect_match.py` and add your keys:
```python
app.set_api_keys(
    petfinder_key="YOUR_PETFINDER_API_KEY",
    petfinder_secret="YOUR_PETFINDER_SECRET"
)
```

### Run Application
```bash
python purrfect_match.py
```

### Run Tests
```bash
python -m pytest test_purrfect_match.py -v
```

## How It Works

1. User takes quiz about living situation, work schedule, experience, preferences
2. Fetches adoptable cats near user's ZIP code from Petfinder
3. Gets breed characteristics from TheCatAPI
4. Calculates compatibility scores:
   - Lifestyle score (40 points): Home type, work schedule, activity match
   - Experience score (30 points): User experience vs cat temperament  
   - Personality score (30 points): Trait matching + allergy considerations
5. Returns ranked list with explanations and shelter contact info

## Files

- `purrfect_match.py` - Main application
- `test_purrfect_match.py` - Unit tests
- `requirements.txt` - Dependencies 