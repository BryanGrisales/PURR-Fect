// Enums
export enum HomeType {
  APARTMENT = 'apartment',
  HOUSE_WITH_YARD = 'house_with_yard',
  FARM_RURAL = 'farm_rural'
}

export enum ExperienceLevel {
  FIRST_TIME = 'first_time',
  SOME_EXPERIENCE = 'some_experience',
  VERY_EXPERIENCED = 'very_experienced'
}

// Main data types
export interface UserProfile {
  id?: string
  homeType: HomeType
  hoursAway: number
  activityLevel: number // 1-10 scale
  experience: ExperienceLevel
  allergies: boolean
  desiredTraits: string[]
  zipCode: string
  createdAt?: string
}

export interface CatProfile {
  petfinderId: string
  name: string
  age: string
  breeds: string[]
  size: string
  gender: string
  description: string
  photos: string[]
  contactEmail: string
  contactPhone: string
  shelterName: string
  distance?: number
  
  // Derived compatibility attributes
  energyLevel: number // 1-10
  independence: number // 1-10
  personalityTraits: string[]
  temperament: 'easy' | 'moderate' | 'challenging'
}

export interface BreedInfo {
  name: string
  temperament: string[]
  origin: string
  description: string
  lifeSpan: string
  hypoallergenic: number // 0 or 1
  energyLevel: number // 1-5 scale from API
  affectionLevel: number // 1-5 scale from API
}

export interface CompatibilityScore {
  catId: string
  totalScore: number // 0-100
  lifestyleScore: number
  experienceScore: number
  personalityScore: number
  reasons: string[]
}

export interface Match {
  cat: CatProfile
  score: CompatibilityScore
  breedInfo?: BreedInfo | null
} 