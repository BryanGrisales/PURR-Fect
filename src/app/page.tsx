import Link from 'next/link'
import { Heart, Sparkles, Users, Award } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-12 h-12 text-pink-500" />
            <h1 className="text-6xl font-bold text-gray-800">
              PurrfectMatch
            </h1>
            <Sparkles className="w-12 h-12 text-purple-500" />
          </div>
          
          <p className="text-2xl text-gray-600 mb-8 leading-relaxed">
            Find your ideal feline companion with our scientifically-backed compatibility matching system
          </p>
          
          <p className="text-lg text-gray-500 mb-12">
            Using real shelter data and breed characteristics to match you with cats based on lifestyle, not just appearance
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quiz" 
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              Take Compatibility Quiz 🐱
            </Link>
            <Link 
              href="/matches" 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-4 px-8 rounded-lg text-lg transition-colors border border-purple-200"
            >
              View Past Matches
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="w-16 h-16 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">3.2M</h3>
              <p className="text-gray-600">Cats enter shelters annually</p>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">530K</h3>
              <p className="text-gray-600">Are euthanized each year</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">Better</h3>
              <p className="text-gray-600">Matches reduce returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Science-backed matching for better adoption outcomes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Take Quiz</h3>
            <p className="text-gray-600">Answer questions about your lifestyle, experience, and preferences</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">Our algorithm analyzes real adoptable cats from local shelters</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Matches</h3>
            <p className="text-gray-600">Receive compatibility scores and detailed explanations</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-pink-600">4</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Find Love</h3>
            <p className="text-gray-600">Contact shelters and meet your perfect feline companion</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-pink-400" />
            <span className="text-xl font-semibold">PurrfectMatch</span>
          </div>
          <p className="text-gray-400">
            Helping cats find their forever homes through better compatibility matching
          </p>
        </div>
      </footer>
    </div>
  )
}
