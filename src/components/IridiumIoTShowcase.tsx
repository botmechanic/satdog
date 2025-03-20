'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';

// Iridium IoT solutions data
const IRIDIUM_IOT_SOLUTIONS = [
  {
    id: 'sbd',
    title: 'Iridium Short Burst Data (SBD)',
    description: 'Globally transferring small data packages from remote field equipment to central monitoring systems',
    details: 'SBD is optimized for transmitting small data packets (less than 2 KB) and provides reliable, bi-directional connectivity for IoT devices in remote areas where no other communication options exist.',
    applications: [
      'Remote asset tracking and monitoring',
      'Environmental monitoring stations',
      'Smart agriculture sensors',
      'Fleet management in remote areas',
      'Maritime vessel monitoring'
    ],
    specifications: {
      messageSize: 'Up to 340 bytes mobile-originated, 270 bytes mobile-terminated',
      latency: 'Typically less than 20 seconds',
      power: 'Low power consumption optimized for battery operation',
      hardware: 'Compact transceivers (as small as 45cc volume)'
    }
  },
  {
    id: 'certus',
    title: 'Iridium Certus IoT',
    description: 'High-value IoT services with versatile, midband speeds up to 704 Kbps',
    details: 'Certus provides higher-bandwidth, IP-based connectivity for more sophisticated IoT applications requiring more frequent data transmission or richer data formats like images or video frames.',
    applications: [
      'Equipment telemetry and remote diagnostics',
      'Scientific research platforms',
      'Autonomous vehicle control',
      'Remote video monitoring',
      'Industrial automation'
    ],
    specifications: {
      speeds: 'Various service levels from 22 Kbps to 704 Kbps',
      interfaces: 'Ethernet/IP, serial, WiFi, Bluetooth',
      reliability: '99.9% network availability',
      coverage: 'Pole-to-pole global coverage'
    }
  },
  {
    id: 'edge',
    title: 'Iridium Edge',
    description: 'Plug-and-play satellite IoT device for adding global connectivity to existing equipment',
    details: 'Iridium Edge is a ready-to-go satellite IoT device that can be quickly deployed alongside existing cellular-based solutions to provide global satellite connectivity when out of cellular range.',
    applications: [
      'Transportation and logistics tracking',
      'Heavy equipment monitoring',
      'Shipping container tracking',
      'Disaster response resources',
      'Oil & gas infrastructure monitoring'
    ],
    specifications: {
      dimensions: '130mm x 90mm x 32mm',
      power: '9-32 VDC',
      interfaces: 'CANBus, RS-232, GPIO',
      features: 'Built-in GPS, Bluetooth connectivity',
      housing: 'Sealed, rugged enclosure for harsh environments'
    }
  }
];

// IoT application case studies
const IOT_CASE_STUDIES = [
  {
    id: 'agriculture',
    title: 'Precision Agriculture',
    challenge: 'Large farms in remote areas need to monitor soil conditions and automate irrigation systems without cellular coverage.',
    solution: 'Iridium SBD-connected soil moisture sensors deployed across thousands of acres, reporting data twice daily and receiving irrigation commands.',
    impact: 'Water usage reduced by 30%, crop yields increased by 22%, and operational costs decreased due to optimized resource allocation and less field travel by staff.',
    hardware: 'Iridium 9603N transceiver integrated with solar-powered sensor arrays'
  },
  {
    id: 'utilities',
    title: 'Electric Grid Monitoring',
    challenge: 'Power utilities need real-time monitoring of remote transmission infrastructure across vast wilderness areas.',
    solution: 'Iridium-connected sensors on power line towers monitor structural integrity, ice loading, and detect potential failures before they occur.',
    impact: 'Prevented 7 major outages in one year, reduced emergency repair costs by 60%, and improved overall grid reliability in extreme weather conditions.',
    hardware: 'Iridium Edge Solar devices with accelerometers and environmental sensors'
  },
  {
    id: 'maritime',
    title: 'Commercial Fishing Fleet Management',
    challenge: 'Commercial fishing fleets need to report catches, monitor vessel performance, and maintain regulatory compliance while at sea.',
    solution: 'Iridium Certus terminals providing reliable connectivity for catch reporting, engine diagnostics, and fleet management applications.',
    impact: 'Reduced fuel consumption by 15% through optimized routing, improved regulatory compliance with automated reporting, and extended equipment life through predictive maintenance.',
    hardware: 'Iridium Certus 700 terminals with integrated vessel management systems'
  }
];

// Technical features of Iridium for IoT
const TECHNICAL_FEATURES = [
  {
    id: 'global',
    title: 'True Global Coverage',
    description: 'Unlike other satellite networks, Iridium covers 100% of the Earth, including polar regions, oceans, and airways.',
    icon: '🌎'
  },
  {
    id: 'lowpower',
    title: 'Low Power Consumption',
    description: 'Optimized transmission protocols and sleep modes allow IoT devices to operate for years on battery power alone.',
    icon: '🔋'
  },
  {
    id: 'compact',
    title: 'Compact Hardware',
    description: 'The smallest transceiver (9603N) is only 3.5cc in volume, allowing integration into highly compact IoT devices.',
    icon: '📱'
  },
  {
    id: 'reliability',
    title: 'Network Reliability',
    description: 'Mesh architecture with cross-linked satellites ensures connection reliability even during ground station outages.',
    icon: '🔄'
  },
  {
    id: 'bidirectional',
    title: 'Bi-directional Communication',
    description: 'Unlike some one-way satellite services, Iridium enables both sending data and receiving commands from IoT devices.',
    icon: '↔️'
  },
  {
    id: 'latency',
    title: 'Low Latency',
    description: 'LEO constellation provides lower latency than GEO satellite systems, ideal for time-sensitive applications.',
    icon: '⏱️'
  }
];

interface SolutionCardProps {
  solution: typeof IRIDIUM_IOT_SOLUTIONS[0];
  onClose: () => void;
}

// Solution card component
function SolutionCard({ solution, onClose }: SolutionCardProps) {
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border-2 border-blue-500">
      <div className="mb-3 px-3 py-1 bg-blue-900/50 rounded-lg text-center">
        <span className="text-xs font-bold text-blue-300">IRIDIUM IOT SOLUTION</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-blue-300">{solution.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <p className="text-white text-sm mb-3">{solution.description}</p>
      <p className="text-gray-300 text-xs mb-4 italic">{solution.details}</p>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">Applications</h4>
        <ul className="text-xs text-white list-disc pl-5 space-y-1">
          {solution.applications.map((app, index) => (
            <li key={index}>{app}</li>
          ))}
        </ul>
      </div>
      
      <button 
        onClick={() => setShowSpecs(!showSpecs)}
        className="text-xs text-cyan-400 hover:text-cyan-300 mb-2"
      >
        {showSpecs ? 'Hide Specifications' : 'Show Specifications'}
      </button>
      
      {showSpecs && (
        <div className="p-3 bg-slate-700 rounded-lg mt-2">
          <h4 className="text-sm font-semibold text-cyan-300 mb-2">Technical Specifications</h4>
          <div className="space-y-1">
            {Object.entries(solution.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-300 capitalize">{key}:</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CaseStudyCardProps {
  case: typeof IOT_CASE_STUDIES[0];
  onClose: () => void;
}

// Case study card component
function CaseStudyCard({ case: caseStudy, onClose }: CaseStudyCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border-2 border-green-500">
      <div className="mb-3 px-3 py-1 bg-green-900/50 rounded-lg text-center">
        <span className="text-xs font-bold text-green-300">IRIDIUM IOT CASE STUDY</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-green-300">{caseStudy.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="p-3 bg-slate-700 rounded">
          <h4 className="text-sm font-semibold text-white mb-1">Challenge:</h4>
          <p className="text-xs text-gray-300">{caseStudy.challenge}</p>
        </div>
        
        <div className="p-3 bg-slate-700 rounded">
          <h4 className="text-sm font-semibold text-white mb-1">Iridium Solution:</h4>
          <p className="text-xs text-gray-300">{caseStudy.solution}</p>
        </div>
        
        <div className="p-3 bg-slate-700 rounded">
          <h4 className="text-sm font-semibold text-white mb-1">Impact:</h4>
          <p className="text-xs text-gray-300">{caseStudy.impact}</p>
        </div>
      </div>
      
      <div className="p-2 bg-green-900/20 rounded-lg">
        <h4 className="text-xs font-semibold text-green-300 mb-1">Hardware Used:</h4>
        <p className="text-xs text-white">{caseStudy.hardware}</p>
      </div>
    </div>
  );
}

export default function IridiumIoTShowcase() {
  const { gameState, showTitle } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'solutions'|'cases'|'features'>('solutions');
  const [activeSolution, setActiveSolution] = useState<typeof IRIDIUM_IOT_SOLUTIONS[0] | null>(null);
  const [activeCaseStudy, setActiveCaseStudy] = useState<typeof IOT_CASE_STUDIES[0] | null>(null);
  
  // Don't show during title screen or when not playing
  if (showTitle || gameState !== 'playing') return null;
  
  // If a specific content is active, render just that
  if (activeSolution) {
    return (
      <div className="absolute top-36 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <SolutionCard solution={activeSolution} onClose={() => setActiveSolution(null)} />
        </div>
      </div>
    );
  }
  
  if (activeCaseStudy) {
    return (
      <div className="absolute top-36 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <CaseStudyCard case={activeCaseStudy} onClose={() => setActiveCaseStudy(null)} />
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* IoT button */}
      <div className="absolute top-36 right-4 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-700 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          aria-label="Iridium IoT Solutions"
        >
          📡
        </button>
        
        {/* Panel when open */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-72 bg-slate-900 rounded-lg shadow-xl border border-blue-700 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-800 p-2 text-center">
              <h3 className="text-sm font-bold text-white">IRIDIUM IOT SOLUTIONS</h3>
              <p className="text-xs text-blue-200">Connected beyond boundaries</p>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'solutions' ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('solutions')}
              >
                Solutions
              </button>
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'cases' ? 'bg-green-900/30 text-green-300 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('cases')}
              >
                Case Studies
              </button>
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'features' ? 'bg-purple-900/30 text-purple-300 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
            </div>
            
            {/* Content based on active tab */}
            <div className="p-3 max-h-80 overflow-y-auto">
              {activeTab === 'solutions' && (
                <div className="space-y-2">
                  {IRIDIUM_IOT_SOLUTIONS.map(solution => (
                    <div
                      key={solution.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer border-l-2 border-blue-500"
                      onClick={() => setActiveSolution(solution)}
                    >
                      <h4 className="text-sm font-semibold text-white">{solution.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{solution.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'cases' && (
                <div className="space-y-2">
                  {IOT_CASE_STUDIES.map(caseStudy => (
                    <div
                      key={caseStudy.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer border-l-2 border-green-500"
                      onClick={() => setActiveCaseStudy(caseStudy)}
                    >
                      <h4 className="text-sm font-semibold text-white">{caseStudy.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{caseStudy.challenge}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'features' && (
                <div className="space-y-2">
                  {TECHNICAL_FEATURES.map(feature => (
                    <div
                      key={feature.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-xl">{feature.icon}</div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{feature.title}</h4>
                          <p className="text-xs text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-700 bg-blue-900/30 text-center">
              <div className="text-xs text-blue-200">
                <span className="font-bold">Iridium IoT:</span> Connecting Remote Assets Globally
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}