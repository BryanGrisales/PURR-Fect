import Link from 'next/link'
import { Heart, ArrowLeft, Clock, Star, Sparkles } from 'lucide-react'

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Back to Home */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="p-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
                <Heart className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Past Matches
          </h1>
          
          <h2 className="text-2xl text-gray-600 mb-8">
            Coming Soon!
          </h2>

          {/* Description */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
                         <p className="text-lg text-gray-700 mb-6">
               We are working on an amazing feature that will let you save and revisit your cat matches!
             </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <Star className="w-6 h-6 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Save Favorites</h3>
                  <p className="text-gray-600 text-sm">Bookmark your top cat matches for easy access</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Heart className="w-6 h-6 text-pink-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Match History</h3>
                  <p className="text-gray-600 text-sm">See all your previous compatibility results</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Sparkles className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Smart Recommendations</h3>
                  <p className="text-gray-600 text-sm">Get personalized cat suggestions based on your preferences</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Quick Access</h3>
                  <p className="text-gray-600 text-sm">Jump right back to where you left off</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to find your perfect match?
            </p>
            <Link
              href="/quiz"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Take Compatibility Quiz
            </Link>
          </div>

          {/* Footer note */}
          <div className="mt-12 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> For now, you can take the quiz to see your matches immediately. 
                             We will add the ability to save and revisit them soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 