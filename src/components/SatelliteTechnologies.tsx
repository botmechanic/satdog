'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

// Additional satellite technologies data
const SATELLITE_TECHNOLOGIES = [
  {
    id: 'sar-imaging',
    title: 'Synthetic Aperture Radar',
    content: 'SAR satellites can create detailed images of Earth through clouds and darkness by emitting radar signals and measuring the returned echoes.',
    advanced: 'SAR uses the satellite\'s movement to simulate a much larger antenna, achieving resolutions as fine as 1 meter from space, even through all weather conditions.',
    image: '/technologies/sar-imaging.svg',
    source: 'European Space Agency',
    companyLogo: '/logos/esa.svg',
    category: 'earth-observation'
  },
  {
    id: 'ion-propulsion',
    title: 'Ion Propulsion',
    content: 'Modern satellites use ion thrusters that accelerate charged particles to create thrust with 10x the efficiency of chemical rockets.',
    advanced: 'Ion thrusters ionize propellant (typically xenon or krypton) and accelerate it with electric fields, achieving specific impulses over 3,000 seconds compared to ~300 for chemical rockets.',
    image: '/technologies/ion-engine.svg',
    source: 'NASA JPL',
    companyLogo: '/logos/nasa.svg',
    category: 'propulsion'
  },
  {
    id: 'optical-comms',
    title: 'Optical Communications',
    content: 'Laser-based optical communications can transmit data between satellites and Earth at rates of gigabits per second, far exceeding radio capabilities.',
    advanced: 'NASA\'s LCRD (Laser Communications Relay Demonstration) achieves 1.2 Gbps data rates - enough to download a full movie in under a minute from geosynchronous orbit.',
    image: '/technologies/laser-comm.svg',
    source: 'NASA',
    companyLogo: '/logos/nasa.svg',
    category: 'communications'
  },
  {
    id: 'cubesats',
    title: 'CubeSat Revolution',
    content: 'CubeSats are standardized small satellites (10x10x10cm units) that have democratized space access with low-cost launch opportunities.',
    advanced: 'From university projects to commercial constellations, over 1,600 CubeSats have been launched since 2000, enabling capabilities previously requiring satellites 100x more expensive.',
    image: '/technologies/cubesat.svg',
    source: 'Cal Poly SLO',
    companyLogo: '/logos/calpoly.svg',
    category: 'smallsat'
  },
  {
    id: 'satellite-servicing',
    title: 'On-Orbit Servicing',
    content: 'Specialized satellites can now repair, refuel, and upgrade other satellites in orbit, extending their lifespan and capabilities.',
    advanced: 'Northrop Grumman\'s MEV (Mission Extension Vehicle) has successfully docked with and extended the life of multiple commercial satellites that would otherwise be decommissioned.',
    image: '/technologies/servicing.svg',
    source: 'Northrop Grumman',
    companyLogo: '/logos/northrop.svg',
    category: 'infrastructure'
  },
  {
    id: 'gnss-tech',
    title: 'Global Navigation Systems',
    content: 'GNSS satellites like GPS use atomic clocks with nanosecond precision to enable global positioning services accurate to within a few meters.',
    advanced: 'Modern GNSS satellites broadcast on multiple frequencies (L1, L2, L5) allowing receivers to correct for ionospheric delays and achieve centimeter-level accuracy.',
    image: '/technologies/gnss.svg',
    source: 'U.S. Space Force',
    companyLogo: '/logos/ussf.svg',
    category: 'navigation'
  },
  {
    id: 'electric-propulsion',
    title: 'All-Electric Satellites',
    content: 'Modern communications satellites use electric propulsion for station-keeping and orbit raising, eliminating heavy chemical propellants.',
    advanced: 'Boeing\'s 702SP platform pioneered all-electric satellites, reducing launch mass by up to 40% but requiring months rather than days to reach final orbit using efficient Hall effect thrusters.',
    image: '/technologies/electric-sat.svg',
    source: 'Boeing',
    companyLogo: '/logos/boeing.svg',
    category: 'propulsion'
  },
  {
    id: 'quantum-comms',
    title: 'Quantum Key Distribution',
    content: 'Satellites can now distribute quantum encryption keys that are fundamentally secure against any computational attack, even from quantum computers.',
    advanced: 'China\'s Micius satellite demonstrated QKD over 1200km, enabling theoretically unbreakable encryption through quantum entanglement that reveals any eavesdropping attempts.',
    image: '/technologies/quantum.svg',
    source: 'Chinese Academy of Sciences',
    companyLogo: '/logos/cas.svg',
    category: 'cybersecurity'
  }
];

// Satellite architecture explanations
const ARCHITECTURE_MODELS = [
  {
    id: 'bent-pipe',
    name: 'Bent-Pipe Architecture',
    description: 'The traditional satellite architecture where satellites act as "mirrors in the sky," simply relaying signals between ground stations without onboard processing.',
    advantages: [
      'Simple, proven design',
      'Lower satellite complexity',
      'Low signal latency through the satellite',
      'Compatible with legacy ground equipment'
    ],
    disadvantages: [
      'Requires ground stations within satellite footprint',
      'Limited coverage area per satellite',
      'Higher end-to-end latency for long distances',
      'Less efficient spectrum usage'
    ],
    examples: ['Traditional TV broadcast satellites', 'Globalstar constellation', 'Early Inmarsat satellites'],
    diagram: '/architectures/bent-pipe.svg'
  },
  {
    id: 'mesh-network',
    name: 'Mesh Network Architecture',
    description: 'Modern satellite constellations that connect directly to each other using inter-satellite links, routing data through space before reaching ground stations.',
    advantages: [
      'Global coverage with fewer ground stations',
      'Lower latency for long-distance communications',
      'More resilient network topology',
      'Reduced dependence on ground infrastructure'
    ],
    disadvantages: [
      'More complex satellite design',
      'Higher power requirements',
      'More challenging network management',
      'Higher initial deployment costs'
    ],
    examples: ['Starlink with laser links', 'Iridium NEXT', 'Telesat Lightspeed'],
    diagram: '/architectures/mesh-network.svg'
  },
  {
    id: 'store-forward',
    name: 'Store-and-Forward Architecture',
    description: 'Satellites that collect data from remote sensors, store it onboard, and later download when passing over ground stations.',
    advantages: [
      'Works for locations with no continuous coverage',
      'Efficient for non-real-time data collection',
      'Lower power requirements for ground sensors',
      'Cost-effective for IoT and remote monitoring'
    ],
    disadvantages: [
      'Not suitable for real-time communications',
      'Limited storage capacity',
      'Data delivery delays',
      'Potential data loss if satellite fails'
    ],
    examples: ['Planet Labs satellites', 'NOAA weather data collection', 'ORBCOMM IoT constellation'],
    diagram: '/architectures/store-forward.svg'
  },
  {
    id: 'hosted-payload',
    name: 'Hosted Payload Architecture',
    description: 'Secondary mission equipment added to commercial satellites, sharing infrastructure to reduce costs.',
    advantages: [
      'Lower cost than dedicated satellites',
      'Faster time to orbit',
      'Shared infrastructure costs',
      'Uses excess capacity on existing platforms'
    ],
    disadvantages: [
      'Limited control over orbit and pointing',
      'Payload constraints imposed by host',
      'Mission timeline dependent on host satellite',
      'Potential conflicts with primary mission'
    ],
    examples: ['GPS payloads on Iridium NEXT', 'GOLD instrument on SES-14', 'Air Force hosted IR sensors'],
    diagram: '/architectures/hosted-payload.svg'
  }
];

// Application case studies
const SATELLITE_APPLICATIONS = [
  {
    id: 'disaster-response',
    title: 'Disaster Response',
    scenario: 'When the 2023 earthquake struck Turkey, satellite communications were crucial after terrestrial infrastructure failed.',
    solution: 'Portable Starlink terminals were deployed within 48 hours, providing emergency services with high-speed communications despite damaged infrastructure.',
    impact: 'Over 35,000 victims were located using satellite coordination, and medical teams used satellite imagery to identify accessible routes to affected areas.',
    providers: ['Starlink', 'Maxar Technologies', 'SES'],
    category: 'emergency'
  },
  {
    id: 'precision-agriculture',
    title: 'Precision Agriculture',
    scenario: 'Farmers in Brazil needed to optimize irrigation and fertilizer use across 20,000 hectares of crops to reduce environmental impact.',
    solution: 'Combining Planet Labs satellite imagery with IoT sensors and GPS-guided equipment created a precision farming system that monitored crop health daily.',
    impact: 'Water usage decreased by 30%, fertilizer application reduced by 25%, and crop yields increased by 15% while minimizing environmental runoff.',
    providers: ['Planet Labs', 'John Deere', 'Trimble Agriculture'],
    category: 'environment'
  },
  {
    id: 'maritime-tracking',
    title: 'Maritime Security',
    scenario: 'Global shipping faces threats from piracy and illegal fishing activities in remote ocean regions beyond coastal radar coverage.',
    solution: 'Spire Global\'s constellation of over 100 nanosatellites tracks AIS signals from vessels globally, identifying suspicious behavior patterns.',
    impact: 'Illegal fishing reduced by 40% in monitored regions, with satellite data providing evidence for over 200 successful maritime enforcement actions annually.',
    providers: ['Spire Global', 'exactEarth', 'ICEYE'],
    category: 'security'
  },
  {
    id: 'telehealth',
    title: 'Remote Telehealth',
    scenario: 'Rural communities in Alaska lacked access to specialist medical care, requiring expensive and dangerous patient transport in emergencies.',
    solution: 'High-throughput satellites enabled video consultations with specialists and real-time transmission of medical imaging data from remote clinics.',
    impact: 'Emergency medical evacuations reduced by 35%, saving $15M annually while improving care for over 100,000 residents in remote communities.',
    providers: ['Viasat', 'OneWeb', 'Hughes Network Systems'],
    category: 'healthcare'
  },
  {
    id: 'climate-monitoring',
    title: 'Climate Monitoring',
    scenario: 'Precise measurement of global carbon sources and sinks is essential for climate change mitigation strategies and policy.',
    solution: 'NASA\'s OCO-2 satellite measures atmospheric CO₂ with precision of 1 ppm, mapping global carbon flux at city-level detail.',
    impact: 'Data has identified previously unknown carbon sources and validated emission reduction efforts, directly informing international climate agreements.',
    providers: ['NASA', 'ESA Copernicus', 'GHGSat'],
    category: 'environment'
  },
  {
    id: 'autonomous-vehicles',
    title: 'Autonomous Navigation',
    scenario: 'Self-driving vehicles require centimeter-level positioning accuracy in all weather conditions and urban environments.',
    solution: 'Trimble and Swift Navigation combine multi-constellation GNSS with correction data delivered via satellite to achieve 2.5cm accuracy.',
    impact: 'Enables lane-level guidance and safe autonomous operation in areas where traditional GPS would have 3-5 meter errors.',
    providers: ['Trimble', 'Swift Navigation', 'Hexagon Positioning'],
    category: 'transportation'
  }
];

// Interface for Technology Card
interface TechnologyCardProps {
  technology: typeof SATELLITE_TECHNOLOGIES[0];
  onClose: () => void;
}

// Technology card component
function TechnologyCard({ technology, onClose }: TechnologyCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-cyan-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-cyan-300">{technology.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4 flex gap-4">
        <div className="w-1/3 bg-slate-700 rounded p-2 flex items-center justify-center">
          <div className="w-20 h-20 bg-cyan-800 rounded-full flex items-center justify-center text-white">
            {technology.category.split('-').map(word => word[0].toUpperCase()).join('')}
          </div>
        </div>
        
        <div className="w-2/3">
          <p className="text-white text-sm mb-2">{technology.content}</p>
          
          {showAdvanced && (
            <p className="text-cyan-200 text-sm italic">{technology.advanced}</p>
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
          <span>Source: {technology.source}</span>
        </div>
      </div>
    </div>
  );
}

// Interface for Architecture Card
interface ArchitectureCardProps {
  architecture: typeof ARCHITECTURE_MODELS[0];
  onClose: () => void;
}

// Architecture card component
function ArchitectureCard({ architecture, onClose }: ArchitectureCardProps) {
  const [activeTab, setActiveTab] = useState<'advantages'|'disadvantages'|'examples'>('advantages');

  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-indigo-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-indigo-300">{architecture.name}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <p className="text-white text-sm mb-4">{architecture.description}</p>
      
      <div className="w-full bg-slate-700 rounded-md p-2 mb-4 flex justify-center">
        <div className="h-24 w-40 bg-indigo-900/50 rounded flex items-center justify-center text-white text-sm">
          {architecture.name} Diagram
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-slate-700 mb-2">
          <button
            className={`flex-1 py-1 text-xs ${activeTab === 'advantages' ? 'text-green-300 border-b border-green-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('advantages')}
          >
            Advantages
          </button>
          <button
            className={`flex-1 py-1 text-xs ${activeTab === 'disadvantages' ? 'text-red-300 border-b border-red-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('disadvantages')}
          >
            Disadvantages
          </button>
          <button
            className={`flex-1 py-1 text-xs ${activeTab === 'examples' ? 'text-blue-300 border-b border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('examples')}
          >
            Examples
          </button>
        </div>
        
        {activeTab === 'advantages' && (
          <ul className="text-xs text-green-200 list-disc pl-5 space-y-1">
            {architecture.advantages.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
        
        {activeTab === 'disadvantages' && (
          <ul className="text-xs text-red-200 list-disc pl-5 space-y-1">
            {architecture.disadvantages.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
        
        {activeTab === 'examples' && (
          <ul className="text-xs text-blue-200 list-disc pl-5 space-y-1">
            {architecture.examples.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Interface for Application Case Study Card
interface ApplicationCardProps {
  application: typeof SATELLITE_APPLICATIONS[0];
  onClose: () => void;
}

// Application card component
function ApplicationCard({ application, onClose }: ApplicationCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 max-w-md w-full shadow-lg border border-amber-400">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-amber-300">{application.title}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="bg-slate-700 p-3 rounded mb-3">
        <h4 className="text-sm font-semibold text-white mb-1">Challenge:</h4>
        <p className="text-xs text-gray-300">{application.scenario}</p>
      </div>
      
      <div className="bg-slate-700 p-3 rounded mb-3">
        <h4 className="text-sm font-semibold text-white mb-1">Satellite Solution:</h4>
        <p className="text-xs text-gray-300">{application.solution}</p>
      </div>
      
      <div className="bg-slate-700 p-3 rounded mb-3">
        <h4 className="text-sm font-semibold text-white mb-1">Impact:</h4>
        <p className="text-xs text-gray-300">{application.impact}</p>
      </div>
      
      <div className="mt-3">
        <h4 className="text-xs font-semibold text-amber-200 mb-1">Solution Providers:</h4>
        <div className="flex flex-wrap gap-2">
          {application.providers.map((provider, i) => (
            <span 
              key={i} 
              className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-full"
            >
              {provider}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SatelliteTechnologies() {
  const { gameState, showTitle } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'technologies'|'architectures'|'applications'>('technologies');
  const [activeTechnology, setActiveTechnology] = useState<typeof SATELLITE_TECHNOLOGIES[0] | null>(null);
  const [activeArchitecture, setActiveArchitecture] = useState<typeof ARCHITECTURE_MODELS[0] | null>(null);
  const [activeApplication, setActiveApplication] = useState<typeof SATELLITE_APPLICATIONS[0] | null>(null);
  
  // Filter functions for categorizing content
  const filterTechnologiesByCategory = (category: string) => {
    return SATELLITE_TECHNOLOGIES.filter(tech => tech.category === category);
  };
  
  const filterApplicationsByCategory = (category: string) => {
    return SATELLITE_APPLICATIONS.filter(app => app.category === category);
  };

  // Don't show during title screen or when not playing
  if (showTitle || gameState !== 'playing') return null;

  // If a specific content is active, render just that
  if (activeTechnology) {
    return (
      <div className="absolute top-20 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <TechnologyCard technology={activeTechnology} onClose={() => setActiveTechnology(null)} />
        </div>
      </div>
    );
  }

  if (activeArchitecture) {
    return (
      <div className="absolute top-20 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <ArchitectureCard architecture={activeArchitecture} onClose={() => setActiveArchitecture(null)} />
        </div>
      </div>
    );
  }

  if (activeApplication) {
    return (
      <div className="absolute top-20 right-4 z-10 pointer-events-auto flex justify-end">
        <div className="pointer-events-auto">
          <ApplicationCard application={activeApplication} onClose={() => setActiveApplication(null)} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Technologies button */}
      <div className="absolute top-20 right-4 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          aria-label="Satellite Technologies"
        >
          🛰️
        </button>

        {/* Technologies panel */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-72 bg-slate-900 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'technologies' ? 'bg-cyan-900/30 text-cyan-300 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('technologies')}
              >
                Technologies
              </button>
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'architectures' ? 'bg-indigo-900/30 text-indigo-300 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('architectures')}
              >
                Architectures
              </button>
              <button
                className={`flex-1 py-2 text-xs ${activeTab === 'applications' ? 'bg-amber-900/30 text-amber-300 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('applications')}
              >
                Case Studies
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="p-3 max-h-80 overflow-y-auto">
              {activeTab === 'technologies' && (
                <>
                  {/* Category headings for technologies */}
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-cyan-300 mb-1">Communications & Data</h3>
                    <div className="space-y-1">
                      {filterTechnologiesByCategory('communications').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                      {filterTechnologiesByCategory('cybersecurity').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-cyan-300 mb-1">Observation & Positioning</h3>
                    <div className="space-y-1">
                      {filterTechnologiesByCategory('earth-observation').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                      {filterTechnologiesByCategory('navigation').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-cyan-300 mb-1">Propulsion & Design</h3>
                    <div className="space-y-1">
                      {filterTechnologiesByCategory('propulsion').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                      {filterTechnologiesByCategory('smallsat').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                      {filterTechnologiesByCategory('infrastructure').map(tech => (
                        <div
                          key={tech.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveTechnology(tech)}
                        >
                          <h4 className="text-sm font-semibold text-white">{tech.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tech.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'architectures' && (
                <div className="space-y-2">
                  {ARCHITECTURE_MODELS.map(architecture => (
                    <div
                      key={architecture.id}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                      onClick={() => setActiveArchitecture(architecture)}
                    >
                      <h4 className="text-sm font-semibold text-white mb-1">{architecture.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{architecture.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'applications' && (
                <>
                  {/* Category headings for applications */}
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-amber-300 mb-1">Infrastructure & Security</h3>
                    <div className="space-y-1">
                      {filterApplicationsByCategory('emergency').concat(
                        filterApplicationsByCategory('security')
                      ).map(app => (
                        <div
                          key={app.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveApplication(app)}
                        >
                          <h4 className="text-sm font-semibold text-white">{app.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{app.scenario}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-amber-300 mb-1">Environment & Resources</h3>
                    <div className="space-y-1">
                      {filterApplicationsByCategory('environment').map(app => (
                        <div
                          key={app.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveApplication(app)}
                        >
                          <h4 className="text-sm font-semibold text-white">{app.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{app.scenario}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-amber-300 mb-1">Human Services</h3>
                    <div className="space-y-1">
                      {filterApplicationsByCategory('healthcare').concat(
                        filterApplicationsByCategory('transportation')
                      ).map(app => (
                        <div
                          key={app.id}
                          className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                          onClick={() => setActiveApplication(app)}
                        >
                          <h4 className="text-sm font-semibold text-white">{app.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{app.scenario}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              {activeTab === 'technologies' && (
                <div className="text-xs text-cyan-300">
                  Explore cutting-edge satellite technologies
                </div>
              )}
              
              {activeTab === 'architectures' && (
                <div className="text-xs text-indigo-300">
                  Learn how satellite systems are designed
                </div>
              )}
              
              {activeTab === 'applications' && (
                <div className="text-xs text-amber-300">
                  Discover real-world satellite applications
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}