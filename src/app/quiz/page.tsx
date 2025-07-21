'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile, HomeType, ExperienceLevel } from '@/types'
import { Heart, Home, Clock, Activity, Star, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function QuizPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<UserProfile>({
    homeType: HomeType.APARTMENT,
    hoursAway: 8,
    activityLevel: 5,
    experience: ExperienceLevel.FIRST_TIME,
    allergies: false,
    desiredTraits: [],
    zipCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // For now, just redirect to results with form data
      // Later we'll implement the actual API call
      const params = new URLSearchParams({
        data: JSON.stringify(formData)
      })
      router.push(`/results?${params.toString()}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (updates: Partial<UserProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      desiredTraits: prev.desiredTraits.includes(trait)
        ? prev.desiredTraits.filter(t => t !== trait)
        : [...prev.desiredTraits, trait]
    }))
  }

  const availableTraits = ['calm', 'playful', 'independent', 'affectionate', 'social', 'shy']

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Heart className="text-pink-500" />
            Find Your Perfect Cat
          </h1>
          <p className="text-lg text-gray-600">Answer a few questions to get personalized matches</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Living Situation */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Home className="text-blue-500 w-6 h-6" />
              <h2 className="text-xl font-semibold">Living Situation</h2>
            </div>
            <p className="text-gray-600 mb-4">Tell us about your home environment</p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="homeType"
                  value={HomeType.APARTMENT}
                  checked={formData.homeType === HomeType.APARTMENT}
                  onChange={(e) => updateFormData({ homeType: e.target.value as HomeType })}
                  className="text-pink-500"
                />
                <span>Apartment</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="homeType"
                  value={HomeType.HOUSE_WITH_YARD}
                  checked={formData.homeType === HomeType.HOUSE_WITH_YARD}
                  onChange={(e) => updateFormData({ homeType: e.target.value as HomeType })}
                  className="text-pink-500"
                />
                <span>House with yard</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="homeType"
                  value={HomeType.FARM_RURAL}
                  checked={formData.homeType === HomeType.FARM_RURAL}
                  onChange={(e) => updateFormData({ homeType: e.target.value as HomeType })}
                  className="text-pink-500"
                />
                <span>Farm/Rural</span>
              </label>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-green-500 w-6 h-6" />
              <h2 className="text-xl font-semibold">Your Schedule</h2>
            </div>
            <p className="text-gray-600 mb-4">How much time can you spend with your cat?</p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hoursAway"
                  value="3"
                  checked={formData.hoursAway === 3}
                  onChange={(e) => updateFormData({ hoursAway: parseInt(e.target.value) })}
                  className="text-pink-500"
                />
                <span>Less than 4 hours away daily</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hoursAway"
                  value="6"
                  checked={formData.hoursAway === 6}
                  onChange={(e) => updateFormData({ hoursAway: parseInt(e.target.value) })}
                  className="text-pink-500"
                />
                <span>4-8 hours away daily</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hoursAway"
                  value="10"
                  checked={formData.hoursAway === 10}
                  onChange={(e) => updateFormData({ hoursAway: parseInt(e.target.value) })}
                  className="text-pink-500"
                />
                <span>More than 8 hours away daily</span>
              </label>
            </div>
          </div>

          {/* Activity Level */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-orange-500 w-6 h-6" />
              <h2 className="text-xl font-semibold">Activity Level</h2>
            </div>
            <p className="text-gray-600 mb-4">How active are you? (1 = Low, 10 = Very Active)</p>
            
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.activityLevel}
                onChange={(e) => updateFormData({ activityLevel: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-orange-500">{formData.activityLevel}</span>
                <span className="text-gray-600">/10</span>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-yellow-500 w-6 h-6" />
              <h2 className="text-xl font-semibold">Experience</h2>
            </div>
            <p className="text-gray-600 mb-4">What&apos;s your experience with cats?</p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="experience"
                  value={ExperienceLevel.FIRST_TIME}
                  checked={formData.experience === ExperienceLevel.FIRST_TIME}
                  onChange={(e) => updateFormData({ experience: e.target.value as ExperienceLevel })}
                  className="text-pink-500"
                />
                <span>First-time owner</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="experience"
                  value={ExperienceLevel.SOME_EXPERIENCE}
                  checked={formData.experience === ExperienceLevel.SOME_EXPERIENCE}
                  onChange={(e) => updateFormData({ experience: e.target.value as ExperienceLevel })}
                  className="text-pink-500"
                />
                <span>Some experience</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="experience"
                  value={ExperienceLevel.VERY_EXPERIENCED}
                  checked={formData.experience === ExperienceLevel.VERY_EXPERIENCED}
                  onChange={(e) => updateFormData({ experience: e.target.value as ExperienceLevel })}
                  className="text-pink-500"
                />
                <span>Very experienced</span>
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allergies}
                    onChange={(e) => updateFormData({ allergies: e.target.checked })}
                    className="text-pink-500"
                  />
                  <span>I have allergies (prefer hypoallergenic breeds)</span>
                </label>
              </div>
              
              <div>
                <p className="font-medium mb-3">Desired personality traits:</p>
                <div className="grid grid-cols-2 gap-3">
                  {availableTraits.map((trait) => (
                    <label key={trait} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.desiredTraits.includes(trait)}
                        onChange={() => toggleTrait(trait)}
                        className="text-pink-500"
                      />
                      <span className="capitalize">{trait}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-purple-500 w-6 h-6" />
              <h2 className="text-xl font-semibold">Location</h2>
            </div>
            <p className="text-gray-600 mb-4">Where should we search for cats?</p>
            
            <input
              type="text"
              placeholder="Enter your ZIP code"
              value={formData.zipCode}
              onChange={(e) => updateFormData({ zipCode: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!formData.zipCode || isLoading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
          >
            {isLoading ? 'Finding Your Perfect Match...' : 'Find My Perfect Cat! 🐱'}
          </button>
        </form>
      </div>
    </div>
  )
} 