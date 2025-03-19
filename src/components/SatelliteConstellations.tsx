'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

// Satellite constellation data
const SATELLITE_CONSTELLATIONS = [
  {
    id: 'starlink',
    name: 'Starlink',
    operator: 'SpaceX',
    description: 'The world\'s largest satellite constellation, providing high-speed, low-latency broadband internet worldwide.',
    details: {
      satellites: {
        count: '5,000+ (as of 2024)',
        target: '12,000 approved; 42,000 proposed',
        orbit: 'LEO (540-570 km)',
        lifetime: '5-7 years',
        mass: '~295 kg (v1.5)',
        size: '3.7m x 2.5m with solar arrays deployed'
      },
      performance: {
        userDownlink: '50-500 Mbps',
        latency: '20-40ms',
        coverage: 'Global (except polar regions)',
        terminals: 'Phased array antenna, ~$599 consumer model',
        subscribers: '1.5+ million (2024)'
      },
      technology: {
        interlinks: 'Laser communication between satellites (v1.5+)',
        frequency: 'Ku-band and Ka-band',
        propulsion: 'Krypton Hall effect thrusters',
        autonomy: 'Automated collision avoidance',
        capacity: '~20 Tbps global capacity'
      }
    },
    applications: [
      'Consumer broadband in rural/remote areas',
      'Maritime and aviation connectivity',
      'Disaster response communications',
      'Military and defense communications',
      'Remote enterprise connectivity'
    ],
    impact: 'Revolutionizing internet access in underserved areas and creating the first truly global broadband network while raising concerns about space sustainability due to unprecedented constellation size.',
    imageUrl: '/constellations/starlink.svg'
  },
  {
    id: 'oneweb',
    name: 'OneWeb',
    operator: 'Eutelsat OneWeb',
    description: 'A global communications network delivering high-speed, low-latency connectivity for governments, businesses, and communities.',
    details: {
      satellites: {
        count: '648 satellites completed',
        target: '648 (full constellation)',
        orbit: 'LEO (1,200 km)',
        lifetime: '7-10 years',
        mass: '150 kg',
        size: '~1m x 1m x 1m (stowed)'
      },
      performance: {
        userDownlink: '50-250 Mbps',
        latency: '30-50ms',
        coverage: 'Global (including polar regions)',
        terminals: 'Enterprise-focused terminals',
        subscribers: 'Enterprise and government customers'
      },
      technology: {
        interlinks: 'None (ground relay architecture)',
        frequency: 'Ku-band',
        propulsion: 'Electric propulsion',
        autonomy: 'Ground-controlled operations',
        capacity: '~10 Tbps global capacity'
      }
    },
    applications: [
      'Enterprise connectivity',
      'Government and defense',
      'Cellular backhaul for remote areas',
      'Maritime and aviation',
      'Emergency response'
    ],
    impact: 'Providing enterprise-grade connectivity globally with special focus on Arctic/polar regions not served by many other constellations.',
    imageUrl: '/constellations/oneweb.svg'
  },
  {
    id: 'kuiper',
    name: 'Project Kuiper',
    operator: 'Amazon',
    description: 'Amazon\'s initiative to deploy a constellation of low Earth orbit satellites for high-speed, low-latency broadband internet service.',
    details: {
      satellites: {
        count: 'Testing phase',
        target: '3,236 satellites approved',
        orbit: 'LEO (590-630 km)',
        lifetime: 'Est. 7-10 years',
        mass: '~510 kg',
        size: 'Proprietary'
      },
      performance: {
        userDownlink: 'Up to 400 Mbps (projected)',
        latency: '~30ms (projected)',
        coverage: 'Global between 56°N and 56°S',
        terminals: 'Phased array antenna (under development)',
        subscribers: 'Future service'
      },
      technology: {
        interlinks: 'Optical inter-satellite links planned',
        frequency: 'Ka-band',
        propulsion: 'Electric propulsion',
        autonomy: 'Automated collision avoidance planned',
        capacity: 'Multi-Tbps planned'
      }
    },
    applications: [
      'Consumer broadband',
      'Enterprise connectivity',
      'Integration with Amazon Web Services',
      'Mobile backhaul',
      'Emergency response'
    ],
    impact: 'Leveraging Amazon\'s existing infrastructure for a complete connectivity ecosystem, including cloud integration, with $10B+ investment.',
    imageUrl: '/constellations/kuiper.svg'
  },
  {
    id: 'telesat',
    name: 'Telesat Lightspeed',
    operator: 'Telesat',
    description: 'Next-generation satellite constellation designed to deliver enterprise-grade broadband anywhere in the world.',
    details: {
      satellites: {
        count: 'Development phase',
        target: '198 satellites planned',
        orbit: 'LEO (1,000 km)',
        lifetime: '10-12 years',
        mass: '~700 kg',
        size: 'Proprietary'
      },
      performance: {
        userDownlink: 'Multiple Gbps to terminals',
        latency: '<50ms',
        coverage: 'Global including polar regions',
        terminals: 'Enterprise-grade terminals',
        subscribers: 'Enterprise and government focus'
      },
      technology: {
        interlinks: 'Optical inter-satellite links',
        frequency: 'Ka-band',
        propulsion: 'Electric propulsion',
        autonomy: 'Sophisticated network management',
        capacity: '~15 Tbps global capacity'
      }
    },
    applications: [
      'Enterprise connectivity',
      'Maritime and aviation',
      'Government services',
      'Cellular backhaul',
      'Carrier-grade network extensions'
    ],
    impact: 'Focusing on fewer satellites with higher capacity per satellite, prioritizing high-value enterprise and government sectors rather than direct consumer service.',
    imageUrl: '/constellations/telesat.svg'
  },
  {
    id: 'iridium',
    name: 'Iridium NEXT',
    operator: 'Iridium Communications',
    description: 'The only satellite communications network with complete global coverage, providing voice and data connectivity to phones and integrated transceivers.',
    details: {
      satellites: {
        count: '66 active satellites + 9 spares',
        target: '66 (full constellation)',
        orbit: 'LEO (780 km)',
        lifetime: '15+ years',
        mass: '860 kg',
        size: '3.1m × 2.4m (with arrays deployed)'
      },
      performance: {
        userDownlink: '352 Kbps - 1.4 Mbps',
        latency: '40-80ms',
        coverage: 'True global (including poles)',
        terminals: 'Satellite phones and IoT devices',
        subscribers: 'Over 1.7 million (2023)'
      },
      technology: {
        interlinks: 'Ka-band crosslinks (pioneered this approach)',
        frequency: 'L-band for user links',
        propulsion: 'Hydrazine propulsion',
        autonomy: 'Sophisticated network routing',
        capacity: 'Optimized for IoT and voice'
      }
    },
    applications: [
      'Maritime safety communications',
      'Aviation safety and operational communications',
      'Remote industrial IoT monitoring',
      'Defense and government communications',
      'Personal communications in remote areas'
    ],
    impact: 'The first and most established LEO constellation, providing reliable global connectivity for critical applications where no other communication options exist.',
    imageUrl: '/constellations/iridium.svg'
  },
  {
    id: 'globalstar',
    name: 'Globalstar',
    operator: 'Globalstar Inc.',
    description: 'Satellite constellation providing voice, data, and emergency notification services to users worldwide.',
    details: {
      satellites: {
        count: '24 active satellites',
        target: '24 (full constellation)',
        orbit: 'LEO (1,414 km)',
        lifetime: '15 years',
        mass: '700 kg',
        size: '6.1m (with arrays deployed)'
      },
      performance: {
        userDownlink: 'Up to 256 Kbps',
        latency: '60-90ms',
        coverage: '80% of Earth\'s surface',
        terminals: 'Satellite phones and IoT devices',
        subscribers: 'Over 745,000 (2023)'
      },
      technology: {
        interlinks: 'None (bent-pipe architecture)',
        frequency: 'L-band and S-band',
        propulsion: 'Hydrazine propulsion',
        autonomy: 'Ground-controlled operations',
        capacity: 'Optimized for IoT and voice'
      }
    },
    applications: [
      'Personal satellite phones',
      'SPOT personal locator beacons',
      'IoT asset tracking',
      'Maritime communications',
      'Emergency response services'
    ],
    impact: 'Providing critical emergency location services through SPOT devices that have initiated over 8,500 rescues worldwide since launch.',
    imageUrl: '/constellations/globalstar.svg'
  }
];

// Comparison metrics for different constellations
const CONSTELLATION_COMPARISONS = [
  {
    metric: 'Satellite Count',
    description: 'Number of satellites in full constellation',
    values: {
      'starlink': '12,000+',
      'oneweb': '648',
      'kuiper': '3,236',
      'telesat': '198',
      'iridium': '66',
      'globalstar': '24'
    },
    winner: 'starlink',
    unit: 'satellites'
  },
  {
    metric: 'User Throughput',
    description: 'Maximum download speed for end-users',
    values: {
      'starlink': '500 Mbps',
      'oneweb': '250 Mbps',
      'kuiper': '400 Mbps',
      'telesat': '1+ Gbps',
      'iridium': '1.4 Mbps',
      'globalstar': '256 Kbps'
    },
    winner: 'telesat',
    unit: 'speeds'
  },
  {
    metric: 'Latency',
    description: 'Network response time (lower is better)',
    values: {
      'starlink': '20-40ms',
      'oneweb': '30-50ms',
      'kuiper': '~30ms',
      'telesat': '<50ms',
      'iridium': '40-80ms',
      'globalstar': '60-90ms'
    },
    winner: 'starlink',
    unit: 'latency'
  },
  {
    metric: 'Global Coverage',
    description: 'Percentage of Earth\'s surface with service',
    values: {
      'starlink': '99%',
      'oneweb': '100%',
      'kuiper': '95%',
      'telesat': '100%',
      'iridium': '100%',
      'globalstar': '80%'
    },
    winner: 'iridium',
    unit: 'coverage'
  }
];

// Common technical challenges across constellations
const TECHNICAL_CHALLENGES = [
  {
    id: 'deorbit',
    title: 'End-of-Life Management',
    description: 'Ensuring satellites are properly deorbited at end-of-life to prevent space debris',
    approaches: [
      'Active deorbit systems using remaining propellant',
      'Drag enhancement devices (sails, balloons)',
      'Design for complete atmospheric burnup',
      'Higher redundancy in critical systems'
    ]
  },
  {
    id: 'collision',
    title: 'Collision Avoidance',
    description: 'Preventing collisions between satellites and with other space objects',
    approaches: [
      'Automated conjunction assessment',
      'Propulsive avoidance maneuvers',
      'Coordination between operators',
      'Space traffic management protocols'
    ]
  },
  {
    id: 'manufacturing',
    title: 'Mass Manufacturing',
    description: 'Producing thousands of satellites at unprecedented rates and cost points',
    approaches: [
      'Automotive-inspired production lines',
      'Vertical integration of components',
      'Design simplification for manufacturability',
      'Automated testing procedures'
    ]
  },
  {
    id: 'terminals',
    title: 'User Terminal Cost',
    description: 'Reducing the cost of complex phased array antennas needed to track LEO satellites',
    approaches: [
      'Electronically steered arrays using silicon chips',
      'Metamaterials for antenna elements',
      'Volume manufacturing economies',
      'Subsidy models for hardware costs'
    ]
  },
  {
    id: 'spectrum',
    title: 'Spectrum Management',
    description: 'Coordinating frequency usage to prevent interference between satellites',
    approaches: [
      'Dynamic frequency allocation',
      'Coordination through ITU processes',
      'Beam forming technology for frequency reuse',
      'Optical interlinks to reduce RF spectrum needs'
    ]
  }
];

// Constellation Card Component
interface ConstellationCardProps {
  constellation: typeof SATELLITE_CONSTELLATIONS[0];
  onClose: () => void;
}

function ConstellationCard({ constellation, onClose }: ConstellationCardProps) {
  const [activeTab, setActiveTab] = useState<'satellites'|'performance'|'technology'|'applications'>('satellites');

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-blue-500">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-xl font-bold text-blue-300">{constellation.name}</h3>
          <p className="text-xs text-gray-300">Operated by: {constellation.operator}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <p className="text-white text-sm mb-4">{constellation.description}</p>
      
      {/* Tabs for different sections */}
      <div className="flex border-b border-slate-700 mb-3">
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'satellites' ? 'text-blue-300 border-b border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('satellites')}
        >
          Satellites
        </button>
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'performance' ? 'text-green-300 border-b border-green-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'technology' ? 'text-purple-300 border-b border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('technology')}
        >
          Technology
        </button>
        <button
          className={`flex-1 py-1 text-xs ${activeTab === 'applications' ? 'text-amber-300 border-b border-amber-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>
      
      {/* Content based on selected tab */}
      <div className="min-h-[200px]">
        {activeTab === 'satellites' && (
          <div className="space-y-1">
            {Object.entries(constellation.details.satellites).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-300 capitalize">{key}:</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="space-y-1">
            {Object.entries(constellation.details.performance).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-300 capitalize">{key}:</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'technology' && (
          <div className="space-y-1">
            {Object.entries(constellation.details.technology).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-300 capitalize">{key}:</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'applications' && (
          <div>
            <ul className="text-xs text-white list-disc pl-5 space-y-1 mb-3">
              {constellation.applications.map((app, index) => (
                <li key={index}>{app}</li>
              ))}
            </ul>
            <p className="text-xs text-blue-200 italic">{constellation.impact}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Comparison Card Component
interface ComparisonCardProps {
  onClose: () => void;
}

function ComparisonCard({ onClose }: ComparisonCardProps) {
  const [activeMetric, setActiveMetric] = useState(CONSTELLATION_COMPARISONS[0]);

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-green-500">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-green-300">Constellation Comparison</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <p className="text-white text-xs mb-3">{activeMetric.description}</p>
      
      {/* Metric selector */}
      <div className="flex mb-3 space-x-2">
        {CONSTELLATION_COMPARISONS.map((comparison, index) => (
          <button
            key={index}
            onClick={() => setActiveMetric(comparison)}
            className={`px-2 py-1 rounded text-xs ${activeMetric.metric === comparison.metric 
              ? 'bg-green-800 text-white' 
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
          >
            {comparison.metric}
          </button>
        ))}
      </div>
      
      {/* Comparison visualization */}
      <div className="space-y-2 mb-3">
        {Object.entries(activeMetric.values).map(([constId, value]) => {
          const constellation = SATELLITE_CONSTELLATIONS.find(c => c.id === constId);
          const isWinner = constId === activeMetric.winner;
          
          return (
            <div key={constId} className="relative">
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${isWinner ? 'text-green-300' : 'text-white'}`}>
                  {constellation?.name}
                  {isWinner && <span className="ml-1 text-green-300">★</span>}
                </span>
                <span className={isWinner ? 'text-green-300 font-bold' : 'text-gray-300'}>
                  {value}
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isWinner ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ 
                    width: getPercentageWidth(constId, activeMetric),
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-green-200 italic">
        {getComparisonInsight(activeMetric)}
      </p>
    </div>
  );
}

// Helper function to calculate percentage width for visualization
function getPercentageWidth(constellationId: string, metric: typeof CONSTELLATION_COMPARISONS[0]): string {
  const values = Object.entries(metric.values).map(([id, val]) => {
    let numericValue = 0;
    
    // Extract numeric value based on metric type
    if (metric.metric === 'Satellite Count') {
      numericValue = parseInt(val.replace(/\D/g, ''));
    } else if (metric.metric === 'User Throughput') {
      if (val.includes('Gbps')) {
        numericValue = parseFloat(val) * 1000;
      } else if (val.includes('Mbps')) {
        numericValue = parseFloat(val);
      } else {
        numericValue = parseFloat(val) / 1000;
      }
    } else if (metric.metric === 'Latency') {
      // Lower is better for latency, so invert the scale
      const match = val.match(/(\d+)/);
      if (match) {
        const latencyValue = parseInt(match[1]);
        numericValue = 100 - latencyValue; // Invert
      }
    } else if (metric.metric === 'Global Coverage') {
      numericValue = parseInt(val);
    }
    
    return { id, value: numericValue };
  });
  
  // Find max value for scaling
  const maxValue = Math.max(...values.map(v => v.value));
  
  // Find this constellation\'s value
  const thisValue = values.find(v => v.id === constellationId)?.value || 0;
  
  // Calculate percentage (minimum 5% for visibility)
  return `${Math.max(5, (thisValue / maxValue) * 100)}%`;
}

// Helper function to generate insights based on current metric
function getComparisonInsight(metric: typeof CONSTELLATION_COMPARISONS[0]): string {
  switch (metric.metric) {
    case 'Satellite Count':
      return 'Larger constellations can provide better coverage but face greater sustainability challenges.';
    case 'User Throughput':
      return 'Enterprise-focused systems like Telesat prioritize higher per-user bandwidth over consumer market scale.';
    case 'Latency':
      return 'All LEO constellations provide significantly lower latency than traditional GEO satellites (500-700ms).';
    case 'Global Coverage':
      return 'Only polar-orbiting constellations like Iridium provide true 100% global coverage including polar regions.';
    default:
      return '';
  }
}

// Technical Challenge Card Component
interface ChallengeCardProps {
  challenge: typeof TECHNICAL_CHALLENGES[0];
  onClose: () => void;
}

function TechnicalChallengeCard({ challenge, onClose }: ChallengeCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-red-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-red-300">{challenge.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <p className="text-white text-sm mb-4">{challenge.description}</p>
      
      <div>
        <h4 className="text-sm font-semibold text-red-200 mb-2">Industry Approaches:</h4>
        <ul className="text-xs text-white list-disc pl-5 space-y-1">
          {challenge.approaches.map((approach, index) => (
            <li key={index}>{approach}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SatelliteConstellations() {
  const { gameState, showTitle } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'constellations'|'comparison'|'challenges'>('constellations');
  const [activeConstellation, setActiveConstellation] = useState<typeof SATELLITE_CONSTELLATIONS[0] | null>(null);
  const [showingComparison, setShowingComparison] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<typeof TECHNICAL_CHALLENGES[0] | null>(null);
  
  // Don't show during title screen or when not playing
  if (showTitle || gameState !== 'playing') return null;
  
  // If a specific content is active, render just that
  if (activeConstellation) {
    return (
      <div className="absolute top-52 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <ConstellationCard constellation={activeConstellation} onClose={() => setActiveConstellation(null)} />
        </div>
      </div>
    );
  }
  
  if (showingComparison) {
    return (
      <div className="absolute top-52 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <ComparisonCard onClose={() => setShowingComparison(false)} />
        </div>
      </div>
    );
  }
  
  if (activeChallenge) {
    return (
      <div className="absolute top-52 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <TechnicalChallengeCard challenge={activeChallenge} onClose={() => setActiveChallenge(null)} />
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Constellations button */}
      <div className="absolute top-52 right-4 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          aria-label="Satellite Constellations"
        >
          🛰️
        </button>
        
        {/* Constellations panel */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-72 bg-slate-900 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'constellations' ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('constellations')}
              >
                Constellations
              </button>
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'comparison' ? 'bg-green-900/30 text-green-300 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('comparison')}
              >
                Comparison
              </button>
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'challenges' ? 'bg-red-900/30 text-red-300 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('challenges')}
              >
                Challenges
              </button>
            </div>
            
            {/* Content based on active tab */}
            <div className="p-3 max-h-80 overflow-y-auto">
              {activeTab === 'constellations' && (
                <div className="space-y-2">
                  {SATELLITE_CONSTELLATIONS.map(constellation => (
                    <div
                      key={constellation.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                      onClick={() => setActiveConstellation(constellation)}
                    >
                      <div className="flex justify-between">
                        <h4 className="text-sm font-semibold text-white">{constellation.name}</h4>
                        <span className="text-xs text-gray-400">{constellation.details.satellites.count}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{constellation.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'comparison' && (
                <div className="p-3">
                  <p className="text-sm text-white mb-3">
                    Compare key metrics across major satellite constellations to understand their different approaches.
                  </p>
                  <button
                    onClick={() => setShowingComparison(true)}
                    className="w-full py-2 bg-green-800 hover:bg-green-700 text-white rounded text-sm"
                  >
                    Open Comparison Tool
                  </button>
                  
                  <div className="mt-3 text-xs text-gray-400">
                    <p>Available metrics include:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {CONSTELLATION_COMPARISONS.map((comparison, index) => (
                        <li key={index}>{comparison.metric}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'challenges' && (
                <div className="space-y-2">
                  {TECHNICAL_CHALLENGES.map(challenge => (
                    <div
                      key={challenge.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                      onClick={() => setActiveChallenge(challenge)}
                    >
                      <h4 className="text-sm font-semibold text-white">{challenge.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{challenge.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <div className="text-xs text-blue-300">
                Learn about the world\'s major satellite networks in operation and development
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}