import { NextRequest, NextResponse } from 'next/server'
import { PetfinderAPIClient, TheCatAPIClient } from '@/lib/api-clients'
import { CompatibilityCalculator } from '@/lib/compatibility'
import { UserProfile } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user: UserProfile = body.user
    
    console.log('Received search request for user:', {
      homeType: user.homeType,
      hoursAway: user.hoursAway,
      activityLevel: user.activityLevel,
      experience: user.experience,
      zipCode: user.zipCode,
      desiredTraits: user.desiredTraits
    })
    
    if (!user.zipCode) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 })
    }

    // Initialize API clients
    const petfinderKey = process.env.PETFINDER_API_KEY
    const petfinderSecret = process.env.PETFINDER_SECRET
    const catApiKey = process.env.CAT_API_KEY

    if (!petfinderKey || !petfinderSecret) {
      console.log('Missing Petfinder API credentials')
      return NextResponse.json({ 
        message: 'API keys needed for Petfinder and TheCatAPI to fetch real cats. Your quiz data was received successfully!',
        matches: [],
        needsApiKeys: true
      }, { status: 200 })
    }

    console.log('Initializing API clients...')
    const petfinderClient = new PetfinderAPIClient(petfinderKey, petfinderSecret)
    const catApiClient = new TheCatAPIClient(catApiKey)
    const calculator = new CompatibilityCalculator()

    // Search for cats
    console.log(`Searching for cats near ${user.zipCode}...`)
    const cats = await petfinderClient.searchCats(user.zipCode, 20)
    
    if (cats.length === 0) {
      console.log('No cats found in the area')
      return NextResponse.json({ 
        message: `No cats found near ${user.zipCode}. Try a different ZIP code or check back later.`,
        matches: []
      }, { status: 200 })
    }

    console.log(`Found ${cats.length} cats, calculating compatibility...`)

    // Get breed information cache
    const breedCache = new Map()
    
    // Calculate compatibility scores
    const matches = []
    for (const cat of cats) {
      let breedInfo = null
      
      if (cat.breeds.length > 0) {
        const breedName = cat.breeds[0]
        if (!breedCache.has(breedName)) {
          console.log(`Looking up breed info for: ${breedName}`)
          breedCache.set(breedName, await catApiClient.getBreedByName(breedName))
        }
        breedInfo = breedCache.get(breedName)
      }
      
      const score = calculator.calculateCompatibility(user, cat, breedInfo)
      matches.push({ cat, score, breedInfo })
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.score.totalScore - a.score.totalScore)

    console.log(`Returning top ${Math.min(10, matches.length)} matches:`)
    matches.slice(0, 10).forEach((match, i) => {
      console.log(`${i + 1}. ${match.cat.name} - ${match.score.totalScore}% compatible`)
    })

    return NextResponse.json({ 
      matches: matches.slice(0, 10), // Return top 10 matches
      total: matches.length,
      message: `Found ${matches.length} cats and calculated compatibility scores!`
    })

  } catch (error) {
    console.error('Error in search-cats API:', error)
    return NextResponse.json({ 
      error: 'Failed to search for cats. Please try again.' 
    }, { status: 500 })
  }
} 