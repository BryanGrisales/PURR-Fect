import { UserProfile, CatProfile, BreedInfo, CompatibilityScore, HomeType, ExperienceLevel } from '@/types'

export class CompatibilityCalculator {
  calculateCompatibility(
    user: UserProfile, 
    cat: CatProfile, 
    breedInfo?: BreedInfo
  ): CompatibilityScore {
    const lifestyleScore = this.calculateLifestyleScore(user, cat)
    const experienceScore = this.calculateExperienceScore(user, cat)
    const personalityScore = this.calculatePersonalityScore(user, cat, breedInfo)
    
    const totalScore = lifestyleScore + experienceScore + personalityScore
    const reasons = this.generateReasons(user, cat, lifestyleScore, experienceScore, personalityScore)
    
    console.log(`Compatibility for ${cat.name}: Lifestyle=${lifestyleScore}/40, Experience=${experienceScore}/30, Personality=${personalityScore}/30, Total=${totalScore}/100`)
    
    return {
      catId: cat.petfinderId,
      totalScore,
      lifestyleScore,
      experienceScore,
      personalityScore,
      reasons
    }
  }

  private calculateLifestyleScore(user: UserProfile, cat: CatProfile): number {
    let score = 0
    
    // Work schedule compatibility (20 points)
    if (user.hoursAway <= 4) {
      score += 20
    } else if (user.hoursAway <= 8) {
      if (cat.independence >= 7) {
        score += 20
      } else {
        score += 12
      }
    } else { // Away 8+ hours
      if (cat.independence >= 8) {
        score += 15
      } else {
        score += 5
      }
    }
    
    // Living space compatibility (10 points)
    if (user.homeType === HomeType.APARTMENT) {
      if (cat.energyLevel <= 5) {
        score += 10
      } else if (cat.energyLevel <= 7) {
        score += 6
      } else {
        score += 2
      }
    } else { // House or farm
      score += 10
    }
    
    // Activity level match (10 points)
    const activityDiff = Math.abs(user.activityLevel - cat.energyLevel)
    score += Math.max(0, 10 - activityDiff)
    
    return Math.min(score, 40)
  }

  private calculateExperienceScore(user: UserProfile, cat: CatProfile): number {
    if (user.experience === ExperienceLevel.FIRST_TIME) {
      if (cat.temperament === 'easy') {
        return 30
      } else if (cat.temperament === 'moderate') {
        return 20
      } else {
        return 10
      }
    } else if (user.experience === ExperienceLevel.SOME_EXPERIENCE) {
      if (cat.temperament === 'easy' || cat.temperament === 'moderate') {
        return 30
      } else {
        return 25
      }
    } else { // Very experienced
      return 30
    }
  }

  private calculatePersonalityScore(
    user: UserProfile, 
    cat: CatProfile, 
    breedInfo?: BreedInfo
  ): number {
    let score = 15 // Base score
    
    // User desired traits vs cat traits
    if (user.desiredTraits.length > 0 && cat.personalityTraits.length > 0) {
      const userTraitsSet = new Set(user.desiredTraits)
      const catTraitsSet = new Set(cat.personalityTraits)
      const matches = [...userTraitsSet].filter(trait => catTraitsSet.has(trait)).length
      const traitBonus = Math.min(matches * 5, 15)
      score += traitBonus
      
      console.log(`Trait matching for ${cat.name}: User wants [${user.desiredTraits.join(', ')}], Cat has [${cat.personalityTraits.join(', ')}], Matches=${matches}, Bonus=+${traitBonus}`)
    }
    
    // Allergy consideration
    if (user.allergies && breedInfo) {
      if (breedInfo.hypoallergenic) {
        score += 0 // No penalty
      } else {
        score -= 10 // Penalty for non-hypoallergenic
        console.log(`Allergy penalty for ${cat.name}: -10 points (non-hypoallergenic)`)
      }
    }
    
    return Math.max(0, Math.min(score, 30))
  }

  private generateReasons(
    user: UserProfile, 
    cat: CatProfile, 
    lifestyle: number, 
    experience: number, 
    personality: number
  ): string[] {
    const reasons: string[] = []
    
    if (lifestyle >= 35) {
      reasons.push('Excellent lifestyle match for your schedule and home')
    } else if (lifestyle >= 25) {
      reasons.push('Good lifestyle compatibility')
    } else {
      reasons.push('Some lifestyle adjustments may be needed')
    }
    
    if (experience >= 25) {
      reasons.push('Perfect match for your experience level')
    } else if (experience >= 20) {
      reasons.push('Suitable for your cat experience')
    } else {
      reasons.push('May be challenging for your current experience')
    }
    
    if (personality >= 25) {
      reasons.push('Strong personality and trait compatibility')
    } else if (personality >= 15) {
      reasons.push('Good personality match')
    } else {
      reasons.push('Some personality differences to consider')
    }
    
    return reasons
  }
} 