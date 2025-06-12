
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, BookOpen, Headphones } from "lucide-react";

export const MemorizationSystem = () => {
  return (
    <div className="space-y-8">
      {/* Method 1: Read Silently Fast with Timer */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl text-blue-800">Method 1: Read Silently Fast, Use Timer, 2 Minutes Per Line</CardTitle>
              <p className="text-blue-600 text-sm mt-1">Sheikh Imran's Timed Method - Build Focus & Photographic Memory</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Principles */}
          <div className="bg-white/70 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Core Principles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Consistency</Badge>
                <p className="text-sm text-gray-600 mt-2">Memorize 5 days a week</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Focus</Badge>
                <p className="text-sm text-gray-600 mt-2">Use timer for urgency</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Efficiency</Badge>
                <p className="text-sm text-gray-600 mt-2">Recite quickly in mind</p>
              </div>
            </div>
          </div>

          {/* Step by Step Process */}
          <div>
            <h3 className="font-semibold text-blue-800 mb-4">The Step-by-Step Timed Method (Line-by-Line)</h3>
            
            {/* Single Line Process */}
            <div className="bg-white/70 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-700 mb-3">1. Memorizing a Single Line:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <h5 className="font-medium text-green-700">Minute 1: Look & Repeat</h5>
                    </div>
                    <p className="text-sm text-gray-700">Set timer for 1 minute. Look at the line and repeat 20-30 times. Build photographic memory through constant scanning.</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <h5 className="font-medium text-purple-700">Minute 2: Recite from Memory</h5>
                    </div>
                    <p className="text-sm text-gray-700">Set timer for 1 minute. Close eyes/look away and recite from memory. Glance quickly if you forget a word.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Connecting Lines Process */}
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-medium text-blue-700 mb-3">2. Connecting the Lines:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <h5 className="font-medium text-orange-700">Minute 3: Connect (While Looking)</h5>
                    </div>
                    <p className="text-sm text-gray-700">Set timer for 1 minute. Recite first and second lines together repeatedly while looking at Mushaf.</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <h5 className="font-medium text-red-700">Minute 4: Connect (From Memory)</h5>
                    </div>
                    <p className="text-sm text-gray-700">Set timer for 1 minute. Recite first and second lines together from memory only.</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                <strong>Continue this process:</strong> After memorizing the third line, connect all three lines using the same method. Build upon what you have memorized.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 2: Break The Page in Parts */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-xl text-green-800">Method 2: Break The Page in Parts</CardTitle>
              <p className="text-green-600 text-sm mt-1">Systematic Quarter-by-Quarter Approach (45 minutes total)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preparation */}
          <div className="bg-white/70 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Preparation (Night Before)
            </h3>
            <p className="text-gray-700">Read the translation of the page and read the page 2-3 times.</p>
          </div>

          {/* Step by Step Process */}
          <div className="grid gap-4">
            {/* Steps 1-3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h5 className="font-medium text-blue-700">Listen to Page</h5>
                  </div>
                  <p className="text-sm text-gray-700"><strong>2 minutes:</strong> Focus on Tajweed sounds</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h5 className="font-medium text-purple-700">Read Full Page</h5>
                  </div>
                  <p className="text-sm text-gray-700"><strong>2 times:</strong> Complete page reading</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h5 className="font-medium text-orange-700">Read Half Page</h5>
                  </div>
                  <p className="text-sm text-gray-700"><strong>3 times:</strong> First half only</p>
                </CardContent>
              </Card>
            </div>

            {/* Quarter-by-Quarter Process */}
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-medium text-green-700 mb-3">4. Quarter-by-Quarter Memorization Process:</h4>
              <div className="grid gap-3">
                <Card className="border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4a</div>
                      <span className="font-medium text-green-700">Break half-page into quarters</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4b</div>
                      <span className="font-medium text-green-700">For each quarter: Read line by line</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">Repeat each line 3 times while looking, then 3 times without looking</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                      <span className="font-medium text-green-700">Quarter Recitation</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">Recite the quarter from memory 3 times</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Final Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-indigo-200 bg-indigo-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                    <h5 className="font-medium text-indigo-700">Half Page Review</h5>
                  </div>
                  <p className="text-sm text-gray-700">1 time looking, 1 time without looking</p>
                </CardContent>
              </Card>
              <Card className="border-teal-200 bg-teal-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">7</div>
                    <h5 className="font-medium text-teal-700">Combine & Recite</h5>
                  </div>
                  <p className="text-sm text-gray-700">Combine two quarters, recite together 3 times</p>
                </CardContent>
              </Card>
              <Card className="border-rose-200 bg-rose-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">8</div>
                    <h5 className="font-medium text-rose-700">Second Half</h5>
                  </div>
                  <p className="text-sm text-gray-700">Repeat steps 4-7 for second half, then combine for full page</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
