export type PregnancyMilestone = {
  weekStart: number;
  weekEnd: number;
  title: string;
  description: string;
  category: 'seguimiento' | 'embarazo' | 'preparacion' | 'bienestar';
};

export const pregnancyMilestones = [
  {
    weekStart: 1,
    weekEnd: 4,
    title: 'Primeros signos',
    description: 'Es posible que estés experimentando algunos síntomas tempranos como cansancio, sensibilidad en los senos o náuseas. Tu cuerpo comienza a adaptarse a la gestación.',
    category: 'seguimiento'
  },
  {
    weekStart: 5,
    weekEnd: 8,
    title: 'Desarrollo embrionario',
    description: 'En esta semana el embrión comienza a formar órganos vitales. Es un período crítico de desarrollo. Programa tu primera visita prenatal si aún no lo has hecho.',
    category: 'embarazo'
  },
  {
    weekStart: 9,
    weekEnd: 12,
    title: 'Primer trimestre',
    description: 'Llegas al final del primer trimestre. Es común sentir más energía y los síntomas iniciales pueden comenzar a disminuir. Primeras ecografías suelen realizarse alrededor de la semana 12.',
    category: 'seguimiento'
  },
  {
    weekStart: 13,
    weekEnd: 16,
    title: 'Segundo trimestre',
    description: 'Muchas personas embarazadas informan sentirse mejor en este período. Es posible que notes el crecimiento del útero y mayor apetito. Control prenatal habitual.',
    category: 'seguimiento'
  },
  {
    weekStart: 17,
    weekEnd: 20,
    title: 'Hitos del segundo trimestre',
    description: 'Puede que sientas los primeros movimientos fetales (quickening). around week 20 suele realizarse la ecografía morfológica. Es un período de crecimiento rápido.',
    category: 'embarazo'
  },
  {
    weekStart: 21,
    weekEnd: 24,
    title: 'Desarrollo fetal',
    description: 'El bebé ya tiene carácterización facial y movimientos más coordinados. Es momento de hablarle y poner música. Las patillas mamarias pueden comenzar alrededor de la semana 22.',
    category: 'embarazo'
  },
  {
    weekStart: 25,
    weekEnd: 28,
    title: 'Tercer trimestre',
    description: 'Empieza el tercer trimestre. El bebé sigue creciendo rápidamente y sus sentidos se desarrollan. Es habitual sentir más molestias físicas por el peso.',
    category: 'seguimiento'
  },
  {
    weekStart: 29,
    weekEnd: 32,
    title: ' Preparación para el parto',
    description: 'Las contracciones de Braxton Hicks pueden hacerse más notables. Es buen momento para preparar la mochila del hospital y el espacio del bebé. Clases de preparación al parto.',
    category: 'preparacion'
  },
  {
    weekStart: 33,
    weekEnd: 36,
    title: 'Primeras señales',
    description: 'El bebé se coloca cada vez más bajó (engaje). Las visitas médicas son más frecuentes. Empieza a tener claro tu plan de parto y tus preferencias para el nacimiento.',
    category: 'preparacion'
  },
  {
    weekStart: 37,
    weekEnd: 40,
    title: 'Termino del embarazo',
    description: 'Se considera que el embarazo a término comienza en la semana 37. El bebé está completamente desarrollado y listo para nacer. Mantén contacto constante con tu profesional sanitario.',
    category: 'bienestar'
  },
  {
    weekStart: 41,
    weekEnd: 42,
    title: 'Semanas post termino',
    description: 'Si el embarazo llega a la semana 42, se considera post termino. El equipo médico realizará seguimiento cercano. Se pueden considerar intervenciones para inducir el parto.',
    category: 'bienestar'
  }
];