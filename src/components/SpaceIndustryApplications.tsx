'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

// Detailed industry application data
const INDUSTRY_APPLICATIONS = [
  {
    id: 'telecommunications',
    name: 'Satellite Telecommunications',
    description: 'Satellite networks provide critical communication services where terrestrial infrastructure is unavailable or inadequate.',
    keyMetrics: [
      'Global satellite internet market valued at $18.59 billion in 2022',
      'Expected to grow at 20.4% CAGR from 2023 to 2030',
      'Over 5,000 active communications satellites in orbit'
    ],
    companies: [
      {
        name: 'Iridium Communications',
        specialty: 'Global voice and data coverage via 66 cross-linked LEO satellites',
        achievement: 'Completed $3 billion constellation renewal with Iridium NEXT satellites in 2019'
      },
      {
        name: 'SpaceX Starlink',
        specialty: 'High-speed, low-latency broadband internet via LEO megaconstellation',
        achievement: 'Surpassed 1 million active subscribers globally in 2023'
      },
      {
        name: 'Viasat',
        specialty: 'High-capacity geostationary satellites providing broadband services',
        achievement: 'ViaSat-3 constellation will provide over 3 Tbps of total network capacity'
      }
    ],
    trends: [
      'Shift from GEO to LEO constellations for lower latency',
      'Inter-satellite laser links reducing ground infrastructure needs',
      'Integration with 5G terrestrial networks',
      'Software-defined satellite architectures for greater flexibility'
    ],
    challenges: [
      'Orbital congestion and frequency coordination',
      'Regulatory approvals across multiple countries',
      'Affordable user terminal technology',
      'Sustainable end-of-life disposal'
    ]
  },
  {
    id: 'earth-observation',
    name: 'Earth Observation & Remote Sensing',
    description: 'Satellites monitor Earth\'s surface, atmosphere, and oceans, providing critical data for government, scientific, and commercial applications.',
    keyMetrics: [
      'Global satellite data services market valued at $7.5 billion in 2022',
      'Over 950 Earth observation satellites currently active',
      'Sub-meter resolution commercially available for satellite imagery'
    ],
    companies: [
      {
        name: 'Planet Labs',
        specialty: 'Daily global imaging via constellation of over 200 "Dove" satellites',
        achievement: 'Collection of over 1,700 images covering every landmass daily at 3-5m resolution'
      },
      {
        name: 'Maxar Technologies',
        specialty: 'Very high-resolution optical imagery (30cm resolution)',
        achievement: 'WorldView Legion constellation will revisit high-demand areas up to 15 times per day'
      },
      {
        name: 'ICEYE',
        specialty: 'Synthetic Aperture Radar (SAR) imaging through clouds and darkness',
        achievement: 'First commercial microsatellite SAR constellation, with <1m resolution'
      }
    ],
    trends: [
      'Hyperspectral imaging for advanced material identification',
      'AI/ML for automated feature extraction and change detection',
      'Fusion of multiple sensor types (optical, SAR, RF) for enhanced insights',
      'Increasing temporal resolution with larger constellations'
    ],
    challenges: [
      'Data processing bottlenecks for petabyte-scale imagery',
      'Cloud cover limiting optical imagery availability',
      'International regulations on high-resolution imagery',
      'Calibration and validation of measurements'
    ]
  },
  {
    id: 'navigation',
    name: 'Global Navigation Satellite Systems',
    description: 'GNSS constellations provide precise positioning, navigation, and timing services critical for countless industries and applications.',
    keyMetrics: [
      'Global GNSS market projected to reach $146.4 billion by 2025',
      'Four global constellations: GPS (US), GLONASS (Russia), Galileo (EU), BeiDou (China)',
      'Over 5 billion GNSS devices in use worldwide'
    ],
    companies: [
      {
        name: 'Trimble',
        specialty: 'High-precision GNSS receivers for surveying, agriculture, and construction',
        achievement: 'Centimeter-level precision through RTK and multi-constellation technology'
      },
      {
        name: 'Hexagon AB',
        specialty: 'Integrated positioning solutions combining GNSS with inertial and other sensors',
        achievement: 'TerraStar X correction technology delivers sub-centimeter accuracy globally'
      },
      {
        name: 'Swift Navigation',
        specialty: 'Affordable precision GNSS solutions for autonomous vehicles',
        achievement: 'Skylark precise point positioning service with cloud-corrections in real-time'
      }
    ],
    trends: [
      'Multi-constellation receivers improving accuracy and reliability',
      'PPP-RTK technology reducing reliance on local base stations',
      'Authentication of GNSS signals to prevent spoofing',
      'Integration with inertial and visual positioning systems'
    ],
    challenges: [
      'Signal vulnerability to jamming and spoofing',
      'Urban canyon and indoor performance limitations',
      'Ionospheric and tropospheric signal delays',
      'Millisecond-level timing accuracy requirements for critical infrastructure'
    ]
  },
  {
    id: 'space-mining',
    name: 'Space Resources Utilization',
    description: 'The nascent industry of identifying, extracting, and utilizing resources from celestial bodies like asteroids and the Moon.',
    keyMetrics: [
      'Potential market value estimated at trillions of dollars',
      'Single asteroid 16 Psyche potentially contains $10,000 quadrillion in metals',
      'Lunar regolith contains oxygen, metals, and water ice in permanently shadowed regions'
    ],
    companies: [
      {
        name: 'Astrobotic',
        specialty: 'Lunar payload delivery and resource prospecting',
        achievement: 'NASA CLPS contract for delivering VIPER rover to search for lunar water ice'
      },
      {
        name: 'ispace',
        specialty: 'Lunar exploration and resource utilization',
        achievement: 'Developing water extraction and storage technologies for lunar ISRU'
      },
      {
        name: 'TransAstra',
        specialty: 'Asteroid mining technology development',
        achievement: 'Optical Mining technology using concentrated sunlight to extract resources'
      }
    ],
    trends: [
      'Focus on lunar water ice as initial target resource',
      'In-situ resource utilization (ISRU) for propellant production',
      'Public-private partnerships for initial infrastructure',
      'Advancements in autonomous robotics for remote operations'
    ],
    challenges: [
      'High upfront costs and long-term investment horizons',
      'Technical challenges of operating in space/lunar environments',
      'Unclear regulatory framework for resource ownership',
      'Need for infrastructure to process and transport materials'
    ]
  },
  {
    id: 'space-manufacturing',
    name: 'In-Space Manufacturing',
    description: 'Utilizing the unique microgravity environment of space to create products with properties impossible to achieve on Earth.',
    keyMetrics: [
      'Global space manufacturing market projected to reach $10 billion by 2030',
      'ISS National Lab hosting over 500 commercial R&D experiments since 2011',
      'Growing interest in producing high-value pharmaceuticals, advanced materials, and optical fibers'
    ],
    companies: [
      {
        name: 'Redwire Space',
        specialty: 'Manufacturing facilities and payload services in LEO',
        achievement: 'First commercially-developed ceramic turbine blisk manufactured in space'
      },
      {
        name: 'Made In Space (now Redwire)',
        specialty: 'Additive manufacturing technology for space applications',
        achievement: 'First commercial 3D printer on ISS and Archinaut in-space manufacturing system'
      },
      {
        name: 'Space Tango',
        specialty: 'Autonomous microgravity research and manufacturing platform',
        achievement: 'CubeLabs providing standardized, automated platforms for microgravity R&D'
      }
    ],
    trends: [
      'ZBLAN optical fiber production as early commercial application',
      'Bioprinting of tissues and organs in microgravity',
      'Development of dedicated manufacturing spacecraft',
      'Recycling of in-space materials for sustainable manufacturing'
    ],
    challenges: [
      'High launch costs for raw materials',
      'Limited volume and power availability in orbit',
      'Product return logistics',
      'Scaling from research to commercial production'
    ]
  },
  {
    id: 'space-tourism',
    name: 'Space Tourism',
    description: 'Commercial services offering civilians the experience of spaceflight, from suborbital flights to orbital stays and beyond.',
    keyMetrics: [
      'Global space tourism market estimated to reach $1.7 billion by 2027',
      'Over 800 future astronauts signed up for suborbital flights',
      'Price points ranging from $250,000 for suborbital to $55 million for orbital stays'
    ],
    companies: [
      {
        name: 'Virgin Galactic',
        specialty: 'Suborbital spaceplane flights for tourism and research',
        achievement: 'Began commercial operations in 2023 after over 15 years of development'
      },
      {
        name: 'Blue Origin',
        specialty: 'Suborbital rocket flights on New Shepard vehicle',
        achievement: 'Carried over 30 passengers to space including founder Jeff Bezos'
      },
      {
        name: 'Axiom Space',
        specialty: 'Private missions to ISS and developing commercial space station',
        achievement: 'Successfully completed multiple private astronaut missions to ISS'
      }
    ],
    trends: [
      'Decreasing prices with operational maturity',
      'Development of dedicated space tourism infrastructure',
      'Expansion from brief experiences to extended stays',
      'Training programs becoming more streamlined and accessible'
    ],
    challenges: [
      'Safety concerns and regulatory requirements',
      'High insurance costs',
      'Environmental impact considerations',
      'Maintaining public interest beyond novelty factor'
    ]
  }
];

// Industry Application Card Component
interface IndustryCardProps {
  industry: typeof INDUSTRY_APPLICATIONS[0];
  onClose: () => void;
}

function IndustryCard({ industry, onClose }: IndustryCardProps) {
  const [activeTab, setActiveTab] = useState<'overview'|'companies'|'trends'|'challenges'>('overview');

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-purple-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-purple-300">{industry.name}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <p className="text-white text-sm mb-4">{industry.description}</p>
      
      {/* Tabs for different sections */}
      <div className="flex border-b border-slate-700 mb-3">
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'overview' ? 'text-blue-300 border-b border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'companies' ? 'text-green-300 border-b border-green-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('companies')}
        >
          Companies
        </button>
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'trends' ? 'text-amber-300 border-b border-amber-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'challenges' ? 'text-red-300 border-b border-red-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </button>
      </div>
      
      {/* Content based on selected tab */}
      <div className="min-h-[200px]">
        {activeTab === 'overview' && (
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Key Metrics</h4>
            <ul className="text-xs text-white list-disc pl-5 space-y-1 mb-3">
              {industry.keyMetrics.map((metric, index) => (
                <li key={index}>{metric}</li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'companies' && (
          <div>
            <h4 className="text-sm font-semibold text-green-300 mb-2">Leading Companies</h4>
            <div className="space-y-3">
              {industry.companies.map((company, index) => (
                <div key={index} className="bg-slate-700 p-2 rounded">
                  <h5 className="text-sm font-semibold text-white">{company.name}</h5>
                  <p className="text-xs text-gray-300 mb-1">{company.specialty}</p>
                  <p className="text-xs text-green-200 italic">Achievement: {company.achievement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div>
            <h4 className="text-sm font-semibold text-amber-300 mb-2">Industry Trends</h4>
            <ul className="text-xs text-white list-disc pl-5 space-y-1">
              {industry.trends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'challenges' && (
          <div>
            <h4 className="text-sm font-semibold text-red-300 mb-2">Key Challenges</h4>
            <ul className="text-xs text-white list-disc pl-5 space-y-1">
              {industry.challenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpaceIndustryApplications() {
  const { gameState, showTitle } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState<typeof INDUSTRY_APPLICATIONS[0] | null>(null);
  
  // Don't show during title screen or when not playing
  if (showTitle || gameState !== 'playing') return null;
  
  // If a specific industry is active, render just that
  if (activeIndustry) {
    return (
      <div className="absolute top-36 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <IndustryCard industry={activeIndustry} onClose={() => setActiveIndustry(null)} />
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Industry Applications button */}
      <div className="absolute top-36 right-4 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-purple-600 hover:bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          aria-label="Space Industry Applications"
        >
          🏭
        </button>
        
        {/* Industry panel */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-72 bg-slate-900 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-purple-300">Space Industry Applications</h3>
              <p className="text-xs text-gray-300">Explore commercial opportunities in space</p>
            </div>
            
            <div className="p-3 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {INDUSTRY_APPLICATIONS.map(industry => (
                  <div
                    key={industry.id}
                    className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    onClick={() => setActiveIndustry(industry)}
                  >
                    <h4 className="text-sm font-semibold text-white">{industry.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{industry.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <div className="text-xs text-purple-300">
                Learn how satellites are transforming industries on Earth
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}