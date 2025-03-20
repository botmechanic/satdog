'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

// Educational fact data about satellite technology
const SATELLITE_FACTS = [
  {
    id: 'iridium-1',
    title: 'Iridium Constellation',
    content: 'The Iridium satellite constellation provides voice and data coverage to satellite phones, pagers and integrated transceivers over the entire Earth surface.',
    advanced: 'With 66 active satellites in orbit, Iridium uses L-band frequencies to provide global coverage without relying on local ground infrastructure.',
    image: '/satellites/iridium.svg',
    source: 'Iridium Communications',
    companyLogo: '/logos/iridium.svg',
    category: 'communications',
    featured: true
  },
  {
    id: 'iridium-certus',
    title: 'Iridium Certus®',
    content: 'Iridium Certus is a multi-service communications platform providing reliable, truly global connectivity for mission-critical applications.',
    advanced: 'Operating on the upgraded Iridium NEXT constellation, Certus delivers high-quality voice, IP data, and IoT services with speeds up to 704 Kbps through compact, lightweight terminals.',
    image: '/satellites/iridium-certus.svg',
    source: 'Iridium Communications',
    companyLogo: '/logos/iridium.svg',
    category: 'communications',
    featured: true
  },
  {
    id: 'iridium-iot',
    title: 'Iridium IoT Solutions',
    content: 'Iridium provides global, two-way satellite communications for IoT applications in remote locations beyond cellular coverage.',
    advanced: 'Iridium\'s Short Burst Data (SBD) service is specifically designed for IoT devices that need to transmit small amounts of data reliably from anywhere on Earth, even in extreme conditions.',
    image: '/satellites/iridium-iot.svg',
    source: 'Iridium Communications',
    companyLogo: '/logos/iridium.svg',
    category: 'iot',
    featured: true
  },
  {
    id: 'starlink-1',
    title: 'Starlink Megaconstellation',
    content: 'SpaceX\'s Starlink aims to provide high-speed, low-latency internet access globally using thousands of small satellites in low Earth orbit.',
    advanced: 'Starlink satellites use inter-satellite laser links to create a mesh network in space, minimizing ground infrastructure needed for global coverage.',
    image: '/satellites/starlink.svg',
    source: 'SpaceX',
    companyLogo: '/logos/spacex.svg',
    category: 'internet'
  },
  {
    id: 'orbit-types',
    title: 'Satellite Orbit Types',
    content: 'Satellites operate in different orbits: Low Earth Orbit (LEO), Medium Earth Orbit (MEO), Geostationary Orbit (GEO), and Highly Elliptical Orbit (HEO).',
    advanced: 'LEO satellites orbit at 160-2,000km altitude, MEO at 2,000-35,786km, and GEO at exactly 35,786km above the equator.',
    image: '/satellites/orbits.svg',
    source: 'NASA',
    companyLogo: '/logos/nasa.svg',
    category: 'orbital-mechanics'
  },
  {
    id: 'space-debris',
    title: 'Space Debris Challenge',
    content: 'There are over 23,000 pieces of orbital debris larger than 10cm being actively tracked in Earth orbit.',
    advanced: 'Modern satellites need collision avoidance systems and end-of-life disposal plans to mitigate the growing problem of space debris.',
    image: '/satellites/debris.svg',
    source: 'European Space Agency',
    companyLogo: '/logos/esa.svg',
    category: 'sustainability'
  },
  {
    id: 'sat-comms',
    title: 'Satellite Communications',
    content: 'Satellites use radio frequencies to transmit data between space and Earth ground stations, with specific bands allocated for different purposes.',
    advanced: 'Modern satellites use frequencies ranging from L-band (1-2 GHz) for mobile services to Ka-band (26-40 GHz) for high-throughput applications.',
    image: '/satellites/communication.svg',
    source: 'International Telecommunication Union',
    companyLogo: '/logos/itu.svg',
    category: 'communications'
  }
];

// Orbital mechanics challenges
const ORBITAL_CHALLENGES = [
  {
    id: 'kepler-laws',
    title: 'Kepler\'s Laws Challenge',
    question: 'According to Kepler\'s Third Law, if satellite A orbits Earth twice as far away as satellite B, how many times longer will satellite A\'s orbital period be?',
    options: ['1.41 times longer', '2 times longer', '2.83 times longer', '4 times longer'],
    correctAnswer: 3, // Index of the correct answer (0-based)
    explanation: 'Kepler\'s Third Law states that the square of the orbital period is proportional to the cube of the semi-major axis. If the distance is doubled, the period increases by a factor of 2^(3/2) = 2.83.',
    difficulty: 'medium'
  },
  {
    id: 'orbital-velocity',
    title: 'Orbital Velocity Challenge',
    question: 'As a satellite moves from perigee (closest point to Earth) to apogee (farthest point from Earth) in an elliptical orbit, what happens to its velocity?',
    options: ['Increases', 'Decreases', 'Remains constant', 'Oscillates randomly'],
    correctAnswer: 1, // Decreases
    explanation: 'According to the law of conservation of angular momentum, a satellite moves faster at perigee and slower at apogee. This is why satellites in elliptical orbits spend more time at higher altitudes.',
    difficulty: 'easy'
  },
  {
    id: 'inclination',
    title: 'Orbital Inclination Challenge',
    question: 'Which orbital inclination would be best for a satellite that needs to provide coverage to polar regions?',
    options: ['0 degrees', '45 degrees', '90 degrees', '180 degrees'],
    correctAnswer: 2, // 90 degrees
    explanation: 'A polar orbit has an inclination of 90 degrees, passing over both poles. This allows the satellite to eventually cover the entire Earth as the planet rotates underneath it.',
    difficulty: 'easy'
  },
  {
    id: 'delta-v',
    title: 'Delta-V Challenge',
    question: 'To change a satellite\'s orbital plane by 60 degrees, when would you need the least amount of delta-v (change in velocity)?',
    options: ['At perigee', 'At apogee', 'At the ascending node', 'Anywhere in the orbit'],
    correctAnswer: 1, // At apogee
    explanation: 'Plane changes require less delta-v when performed at the slowest point in the orbit (apogee) because the velocity that needs to be changed is lower there.',
    difficulty: 'hard'
  },
  {
    id: 'geostationary',
    title: 'Geostationary Orbit Challenge',
    question: 'What is the altitude of a geostationary orbit around Earth?',
    options: ['400 km', '2,000 km', '10,000 km', '35,786 km'],
    correctAnswer: 3, // 35,786 km
    explanation: 'A geostationary orbit has a period of exactly one sidereal day, which occurs at an altitude of 35,786 km above Earth\'s equator.',
    difficulty: 'medium'
  }
];

// Satellite model information
const SATELLITE_MODELS = [
  {
    id: 'iridium-next',
    name: 'Iridium NEXT',
    description: 'The second-generation Iridium constellation, launched between 2017-2019, providing global voice and data coverage.',
    specifications: {
      mass: '860 kg',
      size: '3.1 m × 2.4 m (solar arrays deployed)',
      power: '2.2 kW',
      lifetime: '15+ years',
      orbit: 'Low Earth Orbit (780 km)'
    },
    features: [
      'Ka-band feeder links and crosslinks',
      'L-band subscriber links',
      'Global coverage through 66 active satellites',
      'Hosting capabilities for third-party payloads'
    ],
    manufacturer: 'Thales Alenia Space',
    operator: 'Iridium Communications'
  },
  {
    id: 'starlink-v1',
    name: 'Starlink v1.5',
    description: 'Compact, flat-panel satellites designed to provide high-speed, low-latency internet access globally.',
    specifications: {
      mass: '~295 kg',
      size: '3.7 m × 2.5 m (solar array deployed)',
      power: '~2 kW',
      lifetime: '5-7 years',
      orbit: 'Low Earth Orbit (540-570 km)'
    },
    features: [
      'Inter-satellite laser links',
      'Krypton-powered ion thrusters',
      'Automated collision avoidance',
      'Ku-band and Ka-band phased array antennas'
    ],
    manufacturer: 'SpaceX',
    operator: 'SpaceX'
  },
  {
    id: 'globalstar',
    name: 'Globalstar',
    description: 'Constellation providing voice and data coverage for satellite phones and IoT devices.',
    specifications: {
      mass: '700 kg',
      size: '6.1 m (solar arrays deployed)',
      power: '1.7 kW',
      lifetime: '15 years',
      orbit: 'Low Earth Orbit (1,410 km)'
    },
    features: [
      'Bent-pipe architecture',
      'S-band and L-band frequencies',
      'CDMA technology',
      '24 ground stations worldwide'
    ],
    manufacturer: 'Thales Alenia Space',
    operator: 'Globalstar Inc.'
  }
];

// Define tabs for the educational content
type TabType = 'facts' | 'challenges' | 'models';

interface FactCardProps {
  fact: typeof SATELLITE_FACTS[0];
  onClose: () => void;
}

// Fact card component
function FactCard({ fact, onClose }: FactCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Check if this is an Iridium featured fact
  const isIridiumFeatured = fact.featured && fact.source === 'Iridium Communications';

  return (
    <div className={`bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg ${isIridiumFeatured ? 'border-2 border-blue-400' : 'border border-blue-400'}`}>
      {isIridiumFeatured && (
        <div className="mb-3 px-3 py-1 bg-blue-900/50 rounded-lg text-center">
          <span className="text-xs font-bold text-blue-300">IRIDIUM SPOTLIGHT</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-blue-300">{fact.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4 flex gap-4">
        <div className="w-1/3 bg-slate-700 rounded p-2 flex items-center justify-center">
          {/* We'll create placeholder SVGs later */}
          <div className={`w-20 h-20 ${isIridiumFeatured ? 'bg-blue-600' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white`}>
            {fact.category.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="w-2/3">
          <p className="text-white text-sm mb-2">{fact.content}</p>
          
          {showAdvanced && (
            <p className="text-blue-200 text-sm italic">{fact.advanced}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-cyan-400 hover:text-cyan-300"
        >
          {showAdvanced ? 'Hide Details' : 'Show Advanced Details'}
        </button>
        
        <div className="text-xs text-gray-400 flex items-center">
          <span>Source: {fact.source}</span>
        </div>
      </div>
      
      {isIridiumFeatured && (
        <div className="mt-3 p-2 bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-200">
            Iridium provides critical connectivity solutions for mobile assets in remote locations, 
            offering reliable satellite services where traditional networks cannot reach.
          </p>
        </div>
      )}
    </div>
  );
}

interface ChallengeCardProps {
  challenge: typeof ORBITAL_CHALLENGES[0];
  onClose: () => void;
  onComplete: (correct: boolean) => void;
}

// Challenge card component
function ChallengeCard({ challenge, onClose, onComplete }: ChallengeCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    onComplete(selectedAnswer === challenge.correctAnswer);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-purple-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-purple-300">{challenge.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-white mb-4">{challenge.question}</p>
        
        <div className="space-y-2">
          {challenge.options.map((option, index) => (
            <div 
              key={index}
              className={`p-2 border rounded-md cursor-pointer 
                ${selectedAnswer === index && !showResult ? 'border-yellow-400 bg-slate-700' : 'border-slate-600'} 
                ${showResult && index === challenge.correctAnswer ? 'border-green-500 bg-green-900/30' : ''}
                ${showResult && selectedAnswer === index && index !== challenge.correctAnswer ? 'border-red-500 bg-red-900/30' : ''}
                ${showResult ? 'cursor-default' : 'hover:border-slate-400'}
              `}
              onClick={() => !showResult && setSelectedAnswer(index)}
            >
              <span className="text-white">{option}</span>
            </div>
          ))}
        </div>
        
        {showResult && (
          <div className="mt-4 p-3 bg-slate-700 rounded text-sm text-blue-200">
            <p className="font-bold mb-1">Explanation:</p>
            <p>{challenge.explanation}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        {!showResult ? (
          <button 
            onClick={handleSubmit}
            className={`px-4 py-2 rounded ${selectedAnswer !== null ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </button>
        ) : (
          <span className={selectedAnswer === challenge.correctAnswer ? 'text-green-400' : 'text-red-400'}>
            {selectedAnswer === challenge.correctAnswer ? 'Correct!' : 'Incorrect!'}
          </span>
        )}
        
        <div className="text-xs text-gray-400">
          <span>Difficulty: {challenge.difficulty}</span>
        </div>
      </div>
    </div>
  );
}

interface SatelliteModelCardProps {
  model: typeof SATELLITE_MODELS[0];
  onClose: () => void;
}

// Satellite model info card
function SatelliteModelCard({ model, onClose }: SatelliteModelCardProps) {
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-green-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-green-300">{model.name}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-slate-700 rounded p-2 flex items-center justify-center mb-3">
          {/* Satellite visualization placeholder */}
          <div className="h-24 w-32 bg-green-800 rounded flex items-center justify-center text-white">
            {model.name}
          </div>
        </div>
        
        <p className="text-white text-sm mb-3">{model.description}</p>
        
        {showSpecs && (
          <div className="space-y-3">
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="text-sm font-bold text-green-300 mb-2">Specifications</h4>
              <ul className="text-xs text-white space-y-1">
                {Object.entries(model.specifications).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-gray-300">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-700 p-3 rounded">
              <h4 className="text-sm font-bold text-green-300 mb-2">Key Features</h4>
              <ul className="text-xs text-white list-disc pl-4 space-y-1">
                {model.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="text-xs text-white">
              <p><span className="text-gray-300">Manufacturer:</span> {model.manufacturer}</p>
              <p><span className="text-gray-300">Operator:</span> {model.operator}</p>
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setShowSpecs(!showSpecs)}
        className="text-xs text-green-400 hover:text-green-300"
      >
        {showSpecs ? 'Hide Specifications' : 'Show Specifications'}
      </button>
    </div>
  );
}

// Component ID to educational content mapping
const COMPONENT_TO_EDUCATION: Record<string, {type: TabType, id: string}> = {
  'Antenna': {type: 'facts', id: 'iridium-1'},
  'Modem': {type: 'facts', id: 'sat-comms'},
  'SolarPanel': {type: 'models', id: 'starlink-v1'},
  'Battery': {type: 'models', id: 'globalstar'},
  'OrbitStabilizer': {type: 'challenges', id: 'kepler-laws'}
};

export default function SpaceEducation() {
  const { gameState, showTitle } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('facts');
  const [activeFact, setActiveFact] = useState<typeof SATELLITE_FACTS[0] | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<typeof ORBITAL_CHALLENGES[0] | null>(null);
  const [activeModel, setActiveModel] = useState<typeof SATELLITE_MODELS[0] | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [correctChallenges, setCorrectChallenges] = useState<string[]>([]);
  const [viewedContent, setViewedContent] = useState<string[]>([]);

  // Check for newly collected components to show educational content
  useEffect(() => {
    const checkLastCollected = () => {
      const lastCollectedKey = localStorage.getItem('lastCollectedComponent');
      
      if (lastCollectedKey && !viewedContent.includes(lastCollectedKey)) {
        // Add to viewed content to prevent showing again
        setViewedContent(prev => [...prev, lastCollectedKey]);
        
        // Find the educational content to show
        const contentMap = COMPONENT_TO_EDUCATION[lastCollectedKey];
        if (!contentMap) return;
        
        // Show appropriate content
        if (contentMap.type === 'facts') {
          const fact = SATELLITE_FACTS.find(f => f.id === contentMap.id);
          if (fact) {
            setActiveTab('facts');
            setActiveFact(fact);
          }
        } else if (contentMap.type === 'challenges') {
          const challenge = ORBITAL_CHALLENGES.find(c => c.id === contentMap.id);
          if (challenge) {
            setActiveTab('challenges');
            setActiveChallenge(challenge);
          }
        } else if (contentMap.type === 'models') {
          const model = SATELLITE_MODELS.find(m => m.id === contentMap.id);
          if (model) {
            setActiveTab('models');
            setActiveModel(model);
          }
        }
        
        // Clear the localStorage key
        localStorage.removeItem('lastCollectedComponent');
      }
    };
    
    // Check immediately and set up periodic checking
    checkLastCollected();
    const interval = setInterval(checkLastCollected, 2000);
    
    return () => clearInterval(interval);
  }, [viewedContent]);

  // Handle challenge completion
  const handleChallengeComplete = (challengeId: string, correct: boolean) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges([...completedChallenges, challengeId]);
      if (correct) {
        setCorrectChallenges([...correctChallenges, challengeId]);
      }
    }
  };

  // Don't show during title screen or when not playing
  if (showTitle || gameState !== 'playing') return null;

  // If a specific content is active, render just that
  if (activeFact) {
    return (
      <div className="absolute top-4 right-4 z-50 pointer-events-auto flex justify-end">
        <div className="ui-overlay">
          <FactCard fact={activeFact} onClose={() => setActiveFact(null)} />
        </div>
      </div>
    );
  }

  if (activeChallenge) {
    return (
      <div className="absolute top-4 right-4 z-50 pointer-events-auto flex justify-end">
        <div className="ui-overlay">
          <ChallengeCard 
            challenge={activeChallenge} 
            onClose={() => setActiveChallenge(null)} 
            onComplete={(correct) => handleChallengeComplete(activeChallenge.id, correct)}
          />
        </div>
      </div>
    );
  }

  if (activeModel) {
    return (
      <div className="absolute top-4 right-4 z-50 pointer-events-auto flex justify-end">
        <div className="ui-overlay">
          <SatelliteModelCard model={activeModel} onClose={() => setActiveModel(null)} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Education button */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          aria-label="Space Education"
        >
          🛰️
        </button>

        {/* Education panel */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-72 bg-slate-900 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                className={`flex-1 py-2 text-sm ${activeTab === 'facts' ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('facts')}
              >
                Facts
              </button>
              <button
                className={`flex-1 py-2 text-sm ${activeTab === 'challenges' ? 'bg-purple-900/30 text-purple-300 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('challenges')}
              >
                Challenges
              </button>
              <button
                className={`flex-1 py-2 text-sm ${activeTab === 'models' ? 'bg-green-900/30 text-green-300 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('models')}
              >
                Satellites
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="p-3 max-h-80 overflow-y-auto">
              {activeTab === 'facts' && (
                <div className="space-y-2">
                  {SATELLITE_FACTS.map(fact => (
                    <div
                      key={fact.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer flex items-center"
                      onClick={() => setActiveFact(fact)}
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs mr-2">
                        {fact.category.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{fact.title}</h4>
                        <p className="text-xs text-gray-400">{fact.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'challenges' && (
                <div className="space-y-2">
                  {ORBITAL_CHALLENGES.map(challenge => {
                    const isCompleted = completedChallenges.includes(challenge.id);
                    const isCorrect = correctChallenges.includes(challenge.id);
                    
                    return (
                      <div
                        key={challenge.id}
                        className={`p-2 rounded hover:bg-slate-700 cursor-pointer
                          ${isCompleted ? (isCorrect ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-red-900/30 border-l-4 border-red-500') : 'bg-slate-800'}
                        `}
                        onClick={() => setActiveChallenge(challenge)}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-white">{challenge.title}</h4>
                          <span className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {isCompleted ? (isCorrect ? '✓ Completed' : '✗ Try again') : 'Not attempted'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'models' && (
                <div className="space-y-2">
                  {SATELLITE_MODELS.map(model => (
                    <div
                      key={model.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                      onClick={() => setActiveModel(model)}
                    >
                      <div className="flex items-center mb-1">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs mr-2">
                          {model.id.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="text-sm font-semibold text-white">{model.name}</h4>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{model.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer with progress */}
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              {activeTab === 'challenges' && (
                <div className="text-xs text-gray-300">
                  <div className="flex justify-between mb-1">
                    <span>Challenge Progress:</span>
                    <span>{correctChallenges.length}/{ORBITAL_CHALLENGES.length} correct</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full"
                      style={{ width: `${(correctChallenges.length / ORBITAL_CHALLENGES.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {activeTab === 'facts' && (
                <div className="text-xs text-blue-300">
                  Learn about satellite technology while exploring!
                </div>
              )}
              
              {activeTab === 'models' && (
                <div className="text-xs text-green-300">
                  Discover real satellite designs from leading providers!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Utility function for challenge difficulty colors
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'hard':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}