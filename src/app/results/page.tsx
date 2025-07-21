'use client'

import { useSearchParams } from 'next/navigation'
import { UserProfile, Match } from '@/types'
import { Heart, ArrowLeft, AlertCircle, Phone, Mail, MapPin, Star, Info } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface CatMatchCardProps {
  match: Match
  rank: number
}

function CatMatchCard({ match, rank }: CatMatchCardProps) {
  const { cat, score } = match
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'EXCELLENT'
    if (score >= 60) return 'GOOD'
    return 'FAIR'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-blue-600">#{rank}</span>
              <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score.totalScore)}`}>
                {score.totalScore}% {getScoreLabel(score.totalScore)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{cat.breeds.join(', ') || 'Mixed breed'}</span>
              <span>•</span>
              <span>{cat.age}</span>
              <span>•</span>
              <span>{cat.gender}</span>
              <span>•</span>
              <span>{cat.size}</span>
                             {cat.distance && cat.distance > 0 && (
                 <>
                   <span>•</span>
                   <span className="flex items-center gap-1">
                     <MapPin className="h-4 w-4" />
                     {cat.distance.toFixed(1)} miles
                   </span>
                 </>
               )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Photo */}
          <div className="md:col-span-1">
            {cat.photos.length > 0 ? (
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={cat.photos[0]}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            {/* Compatibility Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Compatibility Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{score.lifestyleScore}/40</div>
                  <div className="text-gray-600">Lifestyle</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{score.experienceScore}/30</div>
                  <div className="text-gray-600">Experience</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-bold text-purple-600">{score.personalityScore}/30</div>
                  <div className="text-gray-600">Personality</div>
                </div>
              </div>
            </div>

            {/* Why This Match */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Why This Match?
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {score.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personality Traits */}
            {cat.personalityTraits.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {cat.personalityTraits.map((trait) => (
                    <span key={trait} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm capitalize">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {cat.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">About {cat.name}</h4>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {cat.description}
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="flex flex-wrap gap-3">
                <div className="text-sm text-gray-600">
                  <strong>Shelter:</strong> {cat.shelterName}
                </div>
                {cat.contactEmail && (
                  <a 
                    href={`mailto:${cat.contactEmail}`}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                {cat.contactPhone && (
                  <a 
                    href={`tel:${cat.contactPhone}`}
                    className="inline-flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const profile = JSON.parse(dataParam) as UserProfile
        setUserProfile(profile)
        // Try to call the API to get matches
        fetchMatches(profile)
      } catch (err) {
        setError('Invalid data received')
        setIsLoading(false)
      }
    } else {
      setError('No quiz data found')
      setIsLoading(false)
    }
  }, [searchParams])

  const fetchMatches = async (profile: UserProfile) => {
    try {
      const response = await fetch('/api/search-cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: profile })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to find matches')
      } else {
        const data = await response.json()
        setMatches(data.matches || [])
        
        // If we got a message but no matches, show the success message
        if (data.message && data.matches?.length === 0) {
          setSuccessMessage(data.message)
        }
      }
    } catch (err) {
      setError('Failed to connect to matching service')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

    if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/quiz" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz
          </Link>
          
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            
            {userProfile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Your Quiz Results:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Home: {userProfile.homeType.replace('_', ' ')}</li>
                  <li>Schedule: {userProfile.hoursAway} hours away daily</li>
                  <li>Activity Level: {userProfile.activityLevel}/10</li>
                  <li>Experience: {userProfile.experience.replace('_', ' ')}</li>
                  <li>Location: {userProfile.zipCode}</li>
                  {userProfile.desiredTraits.length > 0 && (
                    <li>Desired traits: {userProfile.desiredTraits.join(', ')}</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="text-left bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">To enable cat matching:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Get API keys from Petfinder.com and TheCatAPI.com</li>
                  <li>2. Add them to your .env.local file</li>
                  <li>3. Implement the API routes</li>
                  <li>4. Set up the Supabase database</li>
                </ol>
              </div>
              
              <div className="flex gap-4">
                <Link 
                  href="/quiz" 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Take Quiz Again
                </Link>
                <Link 
                  href="/" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/quiz" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz
          </Link>
          
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <Heart className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Completed Successfully! 🎉</h1>
            <p className="text-gray-600 mb-6">
              {successMessage}
            </p>
            
            {userProfile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Your Quiz Results:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Home: {userProfile.homeType.replace('_', ' ')}</li>
                  <li>Schedule: {userProfile.hoursAway} hours away daily</li>
                  <li>Activity Level: {userProfile.activityLevel}/10</li>
                  <li>Experience: {userProfile.experience.replace('_', ' ')}</li>
                  <li>Location: {userProfile.zipCode}</li>
                  {userProfile.desiredTraits.length > 0 && (
                    <li>Desired traits: {userProfile.desiredTraits.join(', ')}</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="flex gap-4">
              <Link 
                href="/quiz" 
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Take Quiz Again
              </Link>
              <Link 
                href="/" 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/quiz" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Quiz
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Perfect Matches! 🐱</h1>
          <p className="text-lg text-gray-600">
            Found {matches.length} compatible cats near you
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {matches.map((match, index) => (
            <CatMatchCard key={match.cat.petfinderId} match={match} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  )
} 