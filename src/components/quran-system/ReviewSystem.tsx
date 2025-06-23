import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, Eye, RotateCcw, TrendingUp, Clock, BookOpen, Target } from "lucide-react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";

export const ReviewSystem = () => {
  return (
    <div className="space-y-8">
      {/* Listening & Reading Off Memory Method */}
      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-l-purple-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle className="text-xl text-purple-800">Listening & Reading Off Memory Method</CardTitle>
              <p className="text-purple-600 text-sm mt-1">Essential Daily Review System for Retention</p>
            </div>
          </div>
        </CardHeader>
        <ExpandableSection initialHeight="150px">
          <CardContent className="space-y-6 pt-0 md:pt-0">
            {/* Introduction */}
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-gray-700 mb-3">
                <strong>Proper review is defined as reciting your memorized portion from memory at least once.</strong> 
                Simply listening or reading from the Mushaf does not count as active review, though these can be supplementary tools.
              </p>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                Ideal: Recite to a review partner who can catch mistakes
              </Badge>
            </div>

            {/* Two-Tier System */}
            <div>
              <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                A. The Two-Tier Active Recitation System
              </h3>
              <p className="text-gray-600 mb-4">Daily practice (at least 5 days a week) divided into two categories:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <h5 className="font-medium text-green-700">Recent Revision</h5>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-800">What it is:</p>
                      <p className="text-sm text-gray-700">Lessons memorized in the last 1-2 weeks</p>
                      <p className="text-sm font-medium text-green-800">How to do it:</p>
                      <p className="text-sm text-gray-700">Review <strong>every single day</strong> until it becomes solid (still fresh and weak)</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <h5 className="font-medium text-blue-700">Old Revision</h5>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">What it is:</p>
                      <p className="text-sm text-gray-700">Juz/Surahs memorized more than 2 weeks ago (stable in memory)</p>
                      <p className="text-sm font-medium text-blue-800">How to do it:</p>
                      <p className="text-sm text-gray-700">Follow set daily schedule based on total memorized amount</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Schedule */}
              <div className="bg-white/70 rounded-lg p-4">
                <h4 className="font-medium text-purple-700 mb-3">Daily Old Revision Schedule:</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-100 rounded">
                    <Badge className="bg-purple-500">Up to 2 Juz</Badge>
                    <span className="text-sm">Review 5 pages per day</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-100 rounded">
                    <Badge className="bg-purple-500">2.5 to 5 Juz</Badge>
                    <span className="text-sm">Review 10 pages (half a Juz) per day</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-100 rounded">
                    <Badge className="bg-purple-500">6 to 10 Juz</Badge>
                    <span className="text-sm">Review 1 full Juz per day</span>
                  </div>
                  <p className="text-sm text-gray-600 italic mt-2">
                    Principle: Add about half a Juz of daily review for every additional 5 Juz memorized
                  </p>
                </div>
              </div>
            </div>

            {/* Passive Listening Method */}
            <div>
              <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                B. The Passive Listening Reinforcement Tool
              </h3>
              <p className="text-gray-600 mb-4">Sheikh Rashid's technique for strengthening Hifdh, improving concentration, and rapid review</p>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <h5 className="font-medium text-orange-700">Find Audio</h5>
                      </div>
                      <p className="text-sm text-gray-700">Use fast-paced (Hadr) recitation, like Sheikh Mishary (~7.5 hours)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-teal-200 bg-teal-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <h5 className="font-medium text-teal-700">Create Playlist</h5>
                      </div>
                      <p className="text-sm text-gray-700">YouTube playlist of only memorized Surahs</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-indigo-200 bg-indigo-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <h5 className="font-medium text-indigo-700">Set Speed</h5>
                      </div>
                      <p className="text-sm text-gray-700">Playback speed at <strong>1.5x</strong> (fast but manageable)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-rose-200 bg-rose-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <h5 className="font-medium text-rose-700">Listen Daily</h5>
                      </div>
                      <p className="text-sm text-gray-700">Follow along daily with memorized portion</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Benefits */}
                <div className="bg-white/70 rounded-lg p-4">
                  <h4 className="font-medium text-purple-700 mb-3">Benefits of Listening Method:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Rapid review (2 Juz in ~15 minutes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Revives and strengthens memory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Sharpens focus and concentration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Enhances learning through listening</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </ExpandableSection>
      </Card>

      {/* Hifdh Strength Program */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <div>
              <CardTitle className="text-xl text-emerald-800">Hifdh Strength Program (After Finishing)</CardTitle>
              <p className="text-emerald-600 text-sm mt-1">For Hifdh graduates aiming to master their memorization</p>
            </div>
          </div>
        </CardHeader>
        <ExpandableSection initialHeight="150px">
          <CardContent className="space-y-6 pt-0 md:pt-0">
            {/* Overview */}
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-gray-700">
                Designed for <strong>Hifdh graduates</strong> who want to solidify and master their memorization, 
                aiming to recite any part of the Qur'an with confidence and minimal mistakes.
              </p>
            </div>

            {/* Step by Step Process */}
            <div>
              <h3 className="font-semibold text-emerald-800 mb-4">Step-By-Step Process</h3>
              
              <div className="grid gap-4">
                {/* Work Backwards */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <h5 className="font-medium text-blue-700">Work Backwards (Reverse Order)</h5>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">Start from <strong>Juz 29</strong> (assuming Juz 30 is already strong)</p>
                      <p className="text-sm text-gray-700">Order: <strong>29, 28, 27, … down to 1</strong></p>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Structure */}
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <h5 className="font-medium text-purple-700">Daily Structure</h5>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700"><strong>Initial Day:</strong> Review current Juz (e.g., Juz 29)</p>
                      <p className="text-sm text-gray-700"><strong>Second Day:</strong> Review next Juz + all previous (e.g., 28 & 29)</p>
                      <p className="text-sm text-gray-700"><strong>Continue Adding:</strong> Each day add next previous Juz + all previous ones</p>
                      <div className="bg-purple-100 p-2 rounded text-sm">
                        <strong>Think of it as:</strong> "New" Juz = daily sabak, Previous ones = sabak-sipara review set
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Handling Workload */}
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <h5 className="font-medium text-orange-700">Handling Increased Workload</h5>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">As you progress, daily load increases (eventually <strong>10+ Juz per day</strong>)</p>
                      <p className="text-sm text-gray-700"><strong>When too much, split sessions:</strong></p>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm text-gray-600">• Morning: Juz 14–22</p>
                        <p className="text-sm text-gray-600">• Evening: Juz 23–30</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <h5 className="font-medium text-green-700">Address Weak Spots</h5>
                      </div>
                      <p className="text-sm text-gray-700">Extra time on weakest Juz. Page-by-page review if needed. Focus on later Juz (22-28).</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-indigo-200 bg-indigo-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                        <h5 className="font-medium text-indigo-700">Don't Chase Perfection</h5>
                      </div>
                      <p className="text-sm text-gray-700">Goal: consistent familiarity. Up to 10 mistakes per Juz is okay. Correction comes with repetition.</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-teal-200 bg-teal-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                        <h5 className="font-medium text-teal-700">Identify Tricky Parts</h5>
                      </div>
                      <p className="text-sm text-gray-700">Track mutashaabihaat (similar verses). Memorize Surah names and numbers for better navigation.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="font-medium text-emerald-700 mb-3">Key Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">Steady improvement with multiple reinforced reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">Huge recall boost - recite any section without warm-ups</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">Minimized forgetfulness - mistakes drop significantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">Systematic approach covering all challenging areas</span>
                </div>
              </div>
            </div>

            {/* Simple Summary */}
            <div className="bg-emerald-100 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-3">Simple Version (Summary)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-emerald-700">
                <li>Start with <strong>Juz 29</strong>, then add Juz 28, 27, etc., going backwards</li>
                <li>Always <strong>review all previously covered Juz</strong> along with the new one</li>
                <li><strong>Split reviews</strong> if it becomes too much for one session</li>
                <li><strong>Don't stress perfection</strong>—repetition will fix mistakes over time</li>
                <li><strong>Track and resolve mutashaabihaat</strong> (similar verses/phrases)</li>
              </ol>
              <div className="mt-3 p-3 bg-emerald-200 rounded text-sm text-emerald-800">
                <strong>Goal:</strong> Reach a point where you can begin at Surah Baqarah and finish Surah Naas in a single sitting—confidently and accurately.
              </div>
            </div>
          </CardContent>
        </ExpandableSection>
      </Card>

      {/* Strengthening Hifdh After Finishing */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-400">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-amber-600" />
            <div>
              <CardTitle className="text-xl text-amber-800">Strengthening Hifdh After Finishing</CardTitle>
              <p className="text-amber-600 text-sm mt-1">Rigorous revision program for solid, long-term retention</p>
            </div>
          </div>
        </CardHeader>
        <ExpandableSection initialHeight="150px">
          <CardContent className="space-y-6 pt-0 md:pt-0">
            {/* Introduction */}
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-gray-700 mb-3">
                This method focuses on <strong>rigorous revision after completing your Hifdh</strong> to build solid, 
                long-term retention. The goal is to reach a level where your memorization remains strong even after years 
                without intensive review.
              </p>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                Target: 6+ Juz per day minimum for solid retention
              </Badge>
            </div>

            {/* Progressive Khatam Schedule */}
            <div>
              <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progressive Khatam Schedule
              </h3>
              <p className="text-gray-600 mb-4">Gradually increase your daily revision load with each complete Qur'an cycle (Khatam):</p>
              
              <div className="grid gap-3">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <span className="font-medium text-blue-700">1st Khatam</span>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-500">2 Juz/day</Badge>
                        <p className="text-xs text-blue-600 mt-1">(1+1 split)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <span className="font-medium text-purple-700">2nd Khatam</span>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-500">2.5 Juz/day</Badge>
                        <p className="text-xs text-purple-600 mt-1">(1.5+1 split)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <span className="font-medium text-green-700">3rd Khatam</span>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500">3 Juz/day</Badge>
                        <p className="text-xs text-green-600 mt-1">(2+1 split)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <span className="font-medium text-orange-700">4th Khatam</span>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-orange-500">3.5 Juz/day</Badge>
                        <p className="text-xs text-orange-600 mt-1">(2.5+1 split)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5-10</div>
                        <span className="font-medium text-red-700">5th-10th Khatam</span>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-500">5 Juz/day</Badge>
                        <p className="text-xs text-red-600 mt-1">(3+2 split)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">11-13</div>
                        <span className="font-medium text-indigo-700">11th-13th Khatam</span>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-indigo-500">15 Juz/day</Badge>
                        <p className="text-xs text-indigo-600 mt-1">(10+5 split)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Key Principles */}
            <div>
              <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Key Principles & Tips
              </h3>
              
              <div className="grid gap-4">
                <div className="bg-white/70 rounded-lg p-4">
                  <h4 className="font-medium text-amber-700 mb-3">During Hifdh Phase:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Maintain <strong>1 Juz of revision per day</strong> consistently</li>
                    <li>Don't expect to recall everything perfectly at all times</li>
                    <li>Focus on maintaining solid daily revision routine</li>
                    <li>The real test begins after completing the entire Qur'an</li>
                  </ul>
                </div>

                <div className="bg-white/70 rounded-lg p-4">
                  <h4 className="font-medium text-amber-700 mb-3">Split Session Strategy:</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Break daily revision into multiple sessions for better retention and manageability:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-amber-100 p-3 rounded text-sm">
                      <strong>Morning Session:</strong> Larger portion (e.g., 10 Juz)
                    </div>
                    <div className="bg-amber-100 p-3 rounded text-sm">
                      <strong>Evening Session:</strong> Smaller portion (e.g., 5 Juz)
                    </div>
                  </div>
                </div>

                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Headphones className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-700">Passive Listening During Rest</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Best tip for solid retention:</strong> Listen to your revision during relaxation time
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                      <li>While resting or lying down</li>
                      <li>Before going to sleep</li>
                      <li>Using earphones during downtime</li>
                      <li>Requires no active effort but provides immense benefits</li>
                    </ul>
                    <div className="mt-3 p-2 bg-green-200 rounded text-xs text-green-800">
                      Surahs practiced this way become so solid they rarely need active review
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="bg-amber-100 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-3">Expected Outcome</h4>
              <p className="text-sm text-amber-700 mb-3">
                After completing this rigorous revision program, your memorization will be so solid that:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">Even after 4+ years without intensive review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">1 Juz per day review with minimal mistakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">Memorization becomes stronger over time</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">Effortless recall and review</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-amber-200 rounded text-sm text-amber-800">
                <strong>Minimum Goal:</strong> Aim to reach at least <strong>6 Juz per day</strong> for solid long-term retention
              </div>
            </div>
          </CardContent>
        </ExpandableSection>
      </Card>
    </div>
  );
};
