import React, { useState, useMemo } from 'react';
import { Search, Heart, Calendar, User, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';

interface HifdhStory {
  id: string;
  title: string;
  author: string;
  summary: string;
  content: {
    introduction: string;
    keyMoments: Array<{
      title: string;
      content: string;
      lesson: string;
    }>;
    advice: string[];
    conclusion: string;
  };
  source: {
    url: string;
    website: string;
  };
  tags: string[];
  readTime: string;
  publishedDate: string;
  highlights: string[];
  fullStory: string;
}

const stories: HifdhStory[] = [
  {
    id: '1',
    title: 'An Amazing Hifdh Story Everyone Needs To Hear',
    author: 'Qāri\' Mubashir',
    summary: 'A remarkable journey of healing through Qur\'an memorization - overcoming multiple health challenges including heart disease, depression, and other ailments through the power of Hifdh.',
    content: {
      introduction: 'This extraordinary story demonstrates how the Qur\'an became both medicine and motivation for a young woman facing multiple health challenges. At just 17-18 years old, she battled heart disease, liver complications, kidney issues, and severe depression while pursuing her Hifdh journey.',
      keyMoments: [
        {
          title: 'The Struggle Begins',
          content: 'Despite memorizing significant portions including Juz\' 30, 29, and several complete surahs like al-Baqarah, Ale-\'Imran, and an-Nisa\', she found no comfort and retreated from memorization as her illnesses worsened.',
          lesson: 'Sometimes we need to step back before we can move forward. Struggles are part of the journey.'
        },
        {
          title: 'The Divine Dream',
          content: 'Years later, when she heard about the Abu Faisal Hifdh course, she had a powerful dream where papers with Qur\'anic verses fell from the sky, with the last one containing verse 39:53: "Do not lose mercy in the Rahmah of Allah." A voice told her, "Do not lose hope in the Rahmah of Allah for we are with you."',
          lesson: 'Allah communicates with sincere hearts in ways that ignite hope and determination.'
        },
        {
          title: 'Miraculous Healings',
          content: 'As she progressed through memorization, her diseases were cured one by one: kidney disease after completing Surah al-Baqarah, uterine disease upon reaching Surah Yusuf, liver disease during the last three juz\', and finally heart disease on the day she completed her entire Hifdh.',
          lesson: 'The Qur\'an is a source of healing - both spiritual and physical - for those who approach it with sincerity.'
        }
      ],
      advice: [
        'Use a "memorization fund" - put money in a box with the intention of ease in your task whenever you want to memorize',
        'Perfume your Mushaf with a scent you love and keep it with you everywhere',
        'Listen to Islamic nasheeds like "Ya Hamil al-Qur\'an" for motivation',
        'Make lots of Istighfar (seeking forgiveness)',
        'Continue reviewing even after completion - the work never ends',
        'Long and yearn for the Qur\'an - develop a love relationship with it',
        'Remember your "why" - you\'ll get what you intend'
      ],
      conclusion: 'This story proves that the Qur\'an is like paradise, life, and bliss. It can untie the burdens of life with its fragrant verses. No matter what challenges you face, approach the Qur\'an with love, consistency, and trust in Allah\'s plan.'
    },
    source: {
      url: 'https://howtomemorisethequran.com/a-hifdh-story-everyone-needs-to-hear/',
      website: 'How To Memorise The Quran'
    },
    tags: ['healing', 'health challenges', 'depression', 'miracles', 'Abu Faisal', 'dreams', 'motivation', 'review', 'completion'],
    readTime: '6 mins',
    publishedDate: 'July 18, 2022',
    highlights: [
      'Cured of 4 different diseases through Qur\'an memorization',
      'Received divine guidance through dreams',
      'Developed unique memorization techniques including the "memorization fund"',
      'Completed full Hifdh despite severe health challenges'
    ],
    fullStory: `This is a Hifdh story that I came across years ago. It's narrated by the memoriser themselves and is an extraordinary story. It's a must-read and must-share for anyone memorising the Qur'ān. It's a story that you can keep on reading for your own motivation and there are some great gems too.

# **My journey of memorising the Qur'ān begins**

Everyone has a story but perhaps my story will ignite your heart (with inspired faith and determination).

Before joining the Abu Faisal program for Hifdh, I used to memorise Qur'ān myself but it was constantly up and down. I didn't need encouragement as it was my belief that a person should be able to motivate themselves.

However, I wasn't well.

I had a number of health challenges such as heart disease, and further complications with my liver, uterus and kidneys. I also had severe depression which led me to seek therapy for 7 years and I was taking pills for my mental health. I was still very young at the time and was in twelve grade (17/18 years old).

I began to commit to reciting and memorising Qur'ān to try to relieve my body pains. I managed to memorise Juz' 30, 29, 17, 18, 19, al-Baqarah, Ale-'Imrān and an-Nisā'... But I really struggled and didn't find any comfort. So I decided to retreat from memorisation for a long while. As my illness got worse, the further I moved away from Allāh and the Qur'ān. I stopped memorising under this pretext. I forgot my comfort was really between the folds of the Qur'ān.

Years later, while at university and I decided to return to memorising the Qur'ān again. During the last year (2015), I heard about the Abu Faisal course (for Hifz) being held in Ibra', Oman. I used to always call my mum and on that day I called her to tell her about the course. I told her that I want to enter it but keeping in mind our financial struggles, I knew I couldn't get in. Then my mum said something that re-kindled the spirit of hope in me. She said:

'No one is pulled to the Qur'ān except that my Rabb facilitates (makes it easy) for them.'

I fell asleep stressing and thinking about how I could enter the course by any means necessary. Then I had a dream.

I saw that I was walking in a valley with little water and papers (or leaves) were falling on me from the sky. Every paper had written on it an āyah of the Qur'ān. The last one I caught had written on it:

'Do not lose mercy in the Rahmah of Allāh.' (39:53).

I heard a voice behind me say, 'Do not lose hope in the Rahmah of Allāh for we are with you, trust in Him alone.'

When I woke up, I received the good news that my mum had entered into the course as money had become available to her!

And when the time came, before entering I had an emotional breakdown. I started crying and crying. I didn't know why but I was certain that day I would find my cure here. That I would find my comfort.

My first day was spent in tears after I first spoke to my teacher. After the second day came to an end, I felt like I'd only entered Islām on that day. I felt I had finally tasted the Qur'ān and what it was doing to my heart. I felt like an angel. I didn't feel like I was walking on the ground. Tears of joy were overwhelming me, falling from my eyes as I grabbed hold of the Qur'ān. I made a promise to my Rabb that I would never give up. That I will succeed and heal with the Qur'ān.

# **I started to find cures for my diseases**

When I finished memorising Surah al-Baqarah I woke up at Fajr and vomited something very bitter. The good news came that day that I had recovered from my kidney disease. A disease that had given me such levels of pain that I wished I had died and not felt any pain ever again. Yet here with the blessings of the Qur'ān, I recovered.

I continued memorising and took on more because I had previously memorised some of the surahs. When I reached Surah Yusuf, I started to cry again. I cried and cried. I don't know why but I had this burst of emotion. That day I had good news- my uterine disease was cured!

I continued my memorisation, and I was sure that I would be cured further. When I came to the last three juz', my liver was scanned. We found that it was cured, Alhamdulillāh!

After this, it was my heart disease that remained. When it came to the day I was to complete my memorisation, I was in the hospital that day for a heart check-up. The doctor said to me, 'We've done comprehensive checks and your heart is completely healthy. I can confirm that there's no evidence of disease.'

Alhamdulillāh, I wished for nothing but two things.

My health and the Qur'ān, and I got it. But my heart continues to yearn for paradise.

# **My advice to all my sisters (and brothers)**

My sisters (and brothers), by Allāh, I had a legitimate excuse in my case but I kept going. I used to dream about the Qur'ān in the form of a very white and handsome man saying to me that I missed you at the Qur'ān session today at Fajr 😊. I longed for it. I loved the Qur'ān. I used to miss the sessions. I fell in love with the Qur'ān and it was my beloved that even when I had an accident and sustained a blow to my head losing consciousness, I found myself reciting Surah al-Baqarah. My friend said to me that she was surprised that in my state I was doing that.

If I want something, I open the Qur'ān with the intention of obtaining what I want. By Allāh, I find it 😊. My life has become only for the Qur'an and I am nicknamed the spokeswoman of the Qur'ān by one of my teachers.

My sisters (and brothers), one of the secrets that I believe helped me memorise the Qur'ān was a box. I bought a box I called, "The memorisation fund." Think of it like a bank. Whenever I wanted to memorise something, I would throw in a 100 for Allāh with the intention and prayer of ease in my task. Alhamdulillāh, I saw the effect. I increase the amount I put in if I felt lazy.

I would perfume my Mus'haf with a scent I loved. It was to accompany me everywhere. My work hasn't finished. I am still reviewing. Every obstacle I face, Allāh takes care of it.

Before Allāh, there are no excuses. Take advantage of the time you have.

I also used to listen to the Nasheed 'Ya Hamil al-Qur'ān' and would make lots of Istighfār. I used to cook and remain with the Qurān.

My sisters (and brothers), the Qur'ān is like paradise, life and bliss. Untie the burdens of your life with its fragrant verses. I'm telling you I had a dream even during menstruation where I saw the Qur'ān say, 'We have missed your sitting with us' which made me cry.

Long and yearn for the Qur'ān!

The story of my memorisation is long, these are but glimpses of my journey.

May Allāh help us memorise and internalise His Book. May we all preserve it and prove we are the carriers of it.

Remember your why! You'll get what you intend. Ameen.`
  }
];

export default function HifdhStories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState<HifdhStory | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredStories = useMemo(() => {
    if (!debouncedSearchTerm) return stories;
    
    const term = debouncedSearchTerm.toLowerCase();
    return stories.filter(story => 
      story.title.toLowerCase().includes(term) ||
      story.author.toLowerCase().includes(term) ||
      story.summary.toLowerCase().includes(term) ||
      story.tags.some(tag => tag.toLowerCase().includes(term)) ||
      story.highlights.some(highlight => highlight.toLowerCase().includes(term))
    );
  }, [debouncedSearchTerm]);

  if (selectedStory) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStory(null)}
          className="mb-6"
        >
          ← Back to Stories
        </Button>
        
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl mb-2 text-green-700">
                  {selectedStory.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedStory.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedStory.publishedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {selectedStory.readTime}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedStory.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-green-100 text-green-700">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <a 
              href={selectedStory.source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Read original on {selectedStory.source.website}
            </a>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="highlights">Key Highlights</TabsTrigger>
                <TabsTrigger value="advice">Practical Advice</TabsTrigger>
                <TabsTrigger value="full-story">Full Story</TabsTrigger>
              </TabsList>
              
              <TabsContent value="story" className="space-y-6 mt-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-green-800">Introduction</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedStory.content.introduction}</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Key Moments</h3>
                  {selectedStory.content.keyMoments.map((moment, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <h4 className="font-medium text-green-700 mb-2">{moment.title}</h4>
                        <p className="text-gray-700 mb-3 leading-relaxed">{moment.content}</p>
                        <div className="bg-amber-50 p-3 rounded border-l-4 border-l-amber-400">
                          <p className="text-amber-800 text-sm font-medium">💡 Lesson: {moment.lesson}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-blue-800">Conclusion</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedStory.content.conclusion}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="highlights" className="mt-6">
                <div className="grid gap-4">
                  {selectedStory.highlights.map((highlight, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{highlight}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="advice" className="mt-6">
                <div className="grid gap-3">
                  {selectedStory.content.advice.map((advice, index) => (
                    <Card key={index} className="border-l-4 border-l-emerald-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{advice}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="full-story" className="mt-6">
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                      {selectedStory.fullStory}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Hifdh Stories
        </h1>
        <p className="text-gray-600 text-lg">
          Inspiring journeys of Qur'an memorization that will motivate and guide your own Hifdh path
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search stories, authors, or keywords..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedStory(story)}>
            <CardHeader>
              <CardTitle className="text-lg text-green-700 mb-2 line-clamp-2">
                {story.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <User className="h-4 w-4" />
                {story.author}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                {story.summary}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {story.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {tag}
                  </Badge>
                ))}
                {story.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{story.tags.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {story.readTime}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  Inspiring
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600">Try adjusting your search terms or browse all stories</p>
        </div>
      )}
    </div>
  );
}
