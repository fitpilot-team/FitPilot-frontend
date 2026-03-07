import { motion } from "framer-motion";

export function AnimatedMolecularBackground() {
  // Aumentado a 60 moléculas para mayor densidad
  const molecules = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    type: i % 3 === 0 ? 'lipid' : i % 2 === 0 ? 'protein' : 'carbon',
    x: Math.random() * 100, // %
    y: Math.random() * 100, // %
    scale: 0.8 + Math.random() * 1.2, // Más grandes para que se vean bien
    duration: 15 + Math.random() * 25, // Animación un poco más rápida
    delay: -(Math.random() * 20), // Para que no empiecen todas al mismo tiempo
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {molecules.map((mol) => (
        <motion.div
          key={mol.id}
          className="absolute"
          style={{
            left: `${mol.x}%`,
            top: `${mol.y}%`,
          }}
          initial={{
            rotate: mol.rotation,
            scale: mol.scale,
            opacity: 0, // Para que el mount no sea brusco
          }}
          animate={{
            y: [0, -60, 40, 0], // Usar transformaciones Y y X para mejor rendimiento y visualización
            x: [0, 40, -30, 0],
            rotate: [mol.rotation, mol.rotation + 90, mol.rotation - 45, mol.rotation],
            opacity: [0.3, 0.6, 0.3], // Mayor opacidad
          }}
          transition={{
            duration: mol.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: mol.delay,
          }}
        >
          {mol.type === 'carbon' && <CarbonChain />}
          {mol.type === 'protein' && <ProteinHelix />}
          {mol.type === 'lipid' && <LipidChain />}
        </motion.div>
      ))}
    </div>
  );
}

// Representa un anillo de carbono (ej. glucosa simplificada)
function CarbonChain() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="stroke-gray-500 fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 30,12 L 42,20 L 42,34 L 30,42 L 18,34 L 18,20 Z" />
      <path d="M 30,12 L 30,4 M 42,34 L 50,40 M 18,34 L 10,40 M 42,20 L 52,14" />
      <line x1="22" y1="22" x2="22" y2="32" />
      <line x1="28" y1="38" x2="38" y2="32" />
      <circle cx="30" cy="4" r="2" className="fill-gray-400" />
      <circle cx="50" cy="40" r="2" className="fill-gray-400" />
      <circle cx="10" cy="40" r="2" className="fill-gray-400" />
      <circle cx="52" cy="14" r="2" className="fill-gray-400" />
    </svg>
  );
}

// Representa una estructura de proteína (hélice alfa)
function ProteinHelix() {
  return (
    <svg width="40" height="80" viewBox="0 0 40 80" className="stroke-gray-400 fill-none" strokeWidth="2" strokeLinecap="round">
      <path d="M20,5 C35,15 35,25 20,35 C5,45 5,55 20,65 C35,75 35,85 20,95" />
      <path d="M20,5 C5,15 5,25 20,35 C35,45 35,55 20,65 C5,75 5,85 20,95" style={{ opacity: 0.3 }} />
      <circle cx="20" cy="5" r="2.5" className="fill-gray-400" />
      <circle cx="20" cy="95" r="2.5" className="fill-gray-400" />
    </svg>
  );
}

// Representa una cadena de grasa (lípido con cabeza polar y cola)
function LipidChain() {
  return (
    <svg width="40" height="90" viewBox="0 0 40 90" className="stroke-gray-500 fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="7" className="fill-gray-300 stroke-gray-500" />
      <path d="M 16,27 L 12,38 L 18,48 L 12,58 L 18,68 L 12,78 L 18,88" />
      <path d="M 24,27 L 28,38 L 22,48 L 28,58 L 22,68 L 28,78 L 22,88" />
    </svg>
  );
}
