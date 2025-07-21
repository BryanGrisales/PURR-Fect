import axios from 'axios'
import { CatProfile, BreedInfo } from '@/types'

export class TheCatAPIClient {
  private baseUrl = 'https://api.thecatapi.com/v1'
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  async getBreeds(): Promise<BreedInfo[]> {
    try {
      const headers = this.apiKey ? { 'x-api-key': this.apiKey } : {}
      const response = await axios.get(`${this.baseUrl}/breeds`, { headers })
      
      console.log(`Retrieved ${response.data.length} cat breeds from TheCatAPI`)
      
      return response.data.map((breed: {
        name?: string;
        temperament?: string;
        origin?: string;
        description?: string;
        life_span?: string;
        hypoallergenic?: number;
        energy_level?: number;
        affection_level?: number;
      }) => ({
        name: breed.name || 'Unknown',
        temperament: breed.temperament ? breed.temperament.split(', ') : [],
        origin: breed.origin || 'Unknown',
        description: breed.description || '',
        lifeSpan: breed.life_span || 'Unknown',
        hypoallergenic: breed.hypoallergenic || 0,
        energyLevel: breed.energy_level || 3,
        affectionLevel: breed.affection_level || 3
      }))
    } catch (error) {
      console.error('Error fetching breeds from TheCatAPI:', error)
      return []
    }
  }

  async getBreedByName(breedName: string): Promise<BreedInfo | null> {
    const breeds = await this.getBreeds()
    return breeds.find(breed => 
      breed.name.toLowerCase() === breedName.toLowerCase()
    ) || null
  }
}

export class PetfinderAPIClient {
  private baseUrl = 'https://api.petfinder.com/v2'
  private accessToken?: string
  private tokenExpires = 0

  constructor(
    private apiKey: string, 
    private secret: string
  ) {}

  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpires) {
      return this.accessToken
    }

    try {
      console.log('Getting Petfinder access token...')
      const response = await axios.post(`${this.baseUrl}/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.secret
      })

      const tokenData = response.data
      this.accessToken = tokenData.access_token
      this.tokenExpires = Date.now() + (tokenData.expires_in - 60) * 1000 // Refresh 1 min early

      console.log('Successfully obtained Petfinder access token')
      return this.accessToken || null
    } catch (error) {
      console.error('Error getting Petfinder access token:', error)
      return null
    }
  }

  async searchCats(location: string, limit = 20): Promise<CatProfile[]> {
    const token = await this.getAccessToken()
    if (!token) return []

    try {
      console.log(`Searching for cats near ${location}...`)
      
      const response = await axios.get(`${this.baseUrl}/animals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: 'cat',
          location,
          limit,
          status: 'adoptable'
        }
      })

      console.log(`Petfinder API returned ${response.data.animals?.length || 0} cats`)

      const seenCats = new Map<string, CatProfile>()

      for (const animal of response.data.animals || []) {
        // Skip non-cats (sometimes Petfinder has mislabeled data)
        if (animal.type && animal.type.toLowerCase() !== 'cat') {
          console.log(`Skipping non-cat: ${animal.name} (type: ${animal.type})`)
          continue
        }
        
        // Skip animals with rabbit-like characteristics in description
        const description = (animal.description || '').toLowerCase()
        if (description.includes('rabbit') || description.includes('bunny') || description.includes('hop')) {
          console.log(`Skipping rabbit/bunny: ${animal.name}`)
          continue
        }
        
        const catId = String(animal.id || '')
        console.log(`Processing cat: ${animal.name} (ID: ${catId})`)
        
        if (seenCats.has(catId)) {
          const existingCat = seenCats.get(catId)!
          
          // Update with more complete information if available
          const currentPhotos = animal.photos?.map((photo: { large?: string }) => photo.large).filter(Boolean) || []
          if (currentPhotos.length > 0 && existingCat.photos.length === 0) {
            existingCat.photos = currentPhotos
          }
          
          const contact = animal.contact || {}
          if (contact.email && !existingCat.contactEmail) {
            existingCat.contactEmail = contact.email
          }
          if (contact.phone && !existingCat.contactPhone) {
            existingCat.contactPhone = contact.phone
          }
          continue
        }

        // Extract breeds
        const breeds: string[] = []
        if (animal.breeds?.primary) breeds.push(animal.breeds.primary)
        if (animal.breeds?.secondary) breeds.push(animal.breeds.secondary)

        // Extract photos
        const photos = animal.photos?.map((photo: { large?: string }) => photo.large).filter(Boolean) || []

        // Extract contact info
        const contact = animal.contact || {}

        const cat: CatProfile = {
          petfinderId: catId,
          name: animal.name || 'Unknown',
          age: animal.age || 'Unknown',
          breeds,
          size: animal.size || 'Unknown',
          gender: animal.gender || 'Unknown',
          description: animal.description || '',
          photos,
          contactEmail: contact.email || '',
          contactPhone: contact.phone || '',
          shelterName: animal.organization_id || 'Unknown Shelter',
          distance: animal.distance || 0,
          energyLevel: 5,
          independence: 5,
          personalityTraits: [],
          temperament: 'moderate'
        }

        this.enhanceCatProfile(cat)
        
        console.log(`Cat ${cat.name}: Energy=${cat.energyLevel}, Independence=${cat.independence}, Traits=[${cat.personalityTraits.join(', ')}]`)
        
        seenCats.set(catId, cat)
      }

      const uniqueCats = Array.from(seenCats.values())
      console.log(`Returning ${uniqueCats.length} unique cats`)
      return uniqueCats
      
    } catch (error) {
      console.error('Error searching Petfinder:', error)
      return []
    }
  }

  private enhanceCatProfile(cat: CatProfile): void {
    const description = cat.description.toLowerCase()
    
    // Analyze description for personality traits
    const traits: string[] = []
    if (/\b(calm|quiet|gentle|peaceful)\b/.test(description)) traits.push('calm')
    if (/\b(playful|active|energetic|loves to play)\b/.test(description)) traits.push('playful')
    if (/\b(independent|self-sufficient)\b/.test(description)) traits.push('independent')
    if (/\b(affectionate|loving|cuddly|lap cat)\b/.test(description)) traits.push('affectionate')
    if (/\b(social|friendly|outgoing)\b/.test(description)) traits.push('social')
    if (/\b(shy|timid|reserved)\b/.test(description)) traits.push('shy')
    
    cat.personalityTraits = traits

    // Estimate energy level
    if (/\b(high energy|very active|energetic)\b/.test(description)) {
      cat.energyLevel = 8
    } else if (/\b(playful|active)\b/.test(description)) {
      cat.energyLevel = 6
    } else if (/\b(calm|quiet|low energy)\b/.test(description)) {
      cat.energyLevel = 3
    }

    // Estimate independence
    if (/\b(independent|self-sufficient)\b/.test(description)) {
      cat.independence = 8
    } else if (/\b(needs attention|very social)\b/.test(description)) {
      cat.independence = 3
    }

    // Estimate temperament
    if (/\b(easy going|gentle|calm)\b/.test(description)) {
      cat.temperament = 'easy'
    } else if (/\b(special needs|requires|challenging)\b/.test(description)) {
      cat.temperament = 'challenging'
    }
  }
} 