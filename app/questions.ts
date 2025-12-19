export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export const CULTURA_GENERAL: Question[] = [
  { id: 'cg1', question: "¿En qué provincia se encuentra la comuna de Catemu?", options: ["Los Andes", "San Felipe de Aconcagua", "Quillota", "Petorca"], answer: 1 },
  { id: 'cg2', question: "¿Qué significa 'Catemu' según su etimología mapudungun?", options: ["Otro lugar de temus", "Valle de uvas", "Cerro de oro", "Río de piedras"], answer: 0 },
  { id: 'cg3', question: "¿Cuál es el color predominante en el escudo de Catemu?", options: ["Rojo y Negro", "Verde y Blanco", "Azul y Oro", "Celeste y Gris"], answer: 2 },
  { id: 'cg4', question: "¿Qué ruta principal atraviesa la comuna conectándola con el resto del país?", options: ["Ruta 68", "Ruta 5 Norte", "Ruta 78", "Camino a Farellones"], answer: 1 },
  { id: 'cg5', question: "¿Cuál es el nombre del cerro que es un símbolo natural de Catemu?", options: ["Cerro Manquehue", "Cerro Caqui", "Cerro El Plomo", "Cerro Santa Lucía"], answer: 1 },
  { id: 'cg6', question: "¿En qué sector se ubica la Fundición de Cobre de Catemu?", options: ["El Olivo", "San José", "Chagres", "Las Varillas"], answer: 2 },
  { id: 'cg7', question: "¿Cuál es el río que irriga las tierras de Catemu?", options: ["Río Maipo", "Río Aconcagua", "Río Mapocho", "Río Biobío"], answer: 1 },
  { id: 'cg8', question: "¿En qué año fue fundada la Primera Compañía de Bomberos de Catemu?", options: ["1948", "1953", "1961", "1970"], answer: 1 },
  { id: 'cg9', question: "¿Quién fue el primer alcalde de la comuna de Catemu?", options: ["Enrique García Huidobro", "José del Carmen Tapia", "Manuel Rodríguez", "Pedro Aguirre Cerda"], answer: 0 },
  { id: 'cg10', question: "¿Aproximadamente cuántos habitantes tiene la comuna de Catemu?", options: ["5.000", "14.500", "50.000", "100.000"], answer: 1 }
];
//

export const FUTBOL_CATEMU: Question[] = [
  { 
    id: 'f1', 
    question: "¿Cuál es el club de fútbol más antiguo de Catemu, fundado en 1904?", 
    options: ["Carmelo de Praga", "Alfredo Riesco", "Estrella de Chile", "Juventud Santa Rosa"], 
    answer: 1 
  },
  { 
    id: 'f2', 
    question: "¿En qué sector juega tradicionalmente el club 'Carmelo de Praga'?", 
    options: ["El Olivo", "Las Coimas", "Chagres", "San Roque"], 
    answer: 1 
  },
  { 
    id: 'f3', 
    question: "¿Qué equipo de Catemu ha destacado históricamente en la Copa de Campeones ARFA?", 
    options: ["Unión San Felipe", "Alfredo Riesco", "Trasandino", "Everton"], 
    answer: 1 
  },
  { 
    id: 'f4', 
    question: "¿Cuál es el estadio principal de la comuna?", 
    options: ["Estadio Regional", "Estadio Municipal de Catemu", "Cancha de El Olivo", "Estadio Lucio Fariña"], 
    answer: 1 
  },
  { 
    id: 'f5', 
    question: "¿Qué club representa tradicionalmente al sector de Chagres?", 
    options: ["Club Minas", "Valle Hermoso", "Unión El Cobre", "Los Maquis"], 
    answer: 2 
  },
  { 
    id: 'f6', 
    question: "¿Cómo se llama el club representativo del sector de Nilhue?", 
    options: ["Juventud Ñilhue", "Estrella de Ñilhue", "Deportivo Ñilhue", "Unión Ñilhue"], 
    answer: 0 
  },
  { 
    id: 'f7', 
    question: "¿Qué club es emblemático del sector de San José?", 
    options: ["Unión San José", "Recreativo San José", "Deportivo San José", "San José Unido"], 
    answer: 1 
  },
  { 
    id: 'f8', 
    question: "¿De qué colores es la camiseta tradicional de Estrella de Chile de Catemu?", 
    options: ["Azul y Blanco", "Verde y Blanco", "Rojo y Blanco", "Amarillo y Negro"], 
    answer: 2 
  },
  { 
    id: 'f9', 
    question: "¿Cómo se llama la organización que agrupa a los clubes locales?", 
    options: ["Liga Aconcagua", "Asociación de Fútbol de Catemu", "Unión Local", "Anfa San Felipe"], 
    answer: 1 
  },
  { 
    id: 'f10', 
    question: "¿Cuál de estos clubes pertenece al sector de Reinoso?", 
    options: ["Peñarol de Reinoso", "Independiente Reinoso", "Unión Reinoso", "Deportivo Reinoso"], 
    answer: 0 
  }
];

//Rodeo

export const RODEO_CATEMU: Question[] = [
  {
    id: 'r1',
    question: "¿En qué fecha del año se celebra tradicionalmente el Rodeo Oficial de Catemu?",
    options: ["Enero", "Durante Fiestas Patrias", "Mayo", "Agosto"],
    answer: 1
  },
  {
    id: 'r2',
    question: "¿Cuál es el recinto tradicional donde se realizan las actividades de rodeo en Catemu?",
    options: ["La Medialuna de Catemu", "Estadio Municipal", "Parque O'Higgins", "Quinta Vergara"],
    answer: 0
  },
  {
    id: 'r3',
    question: "¿Qué sector de Catemu es reconocido por su tradición huasa y crianza de caballos?",
    options: ["Viña del Mar", "El Olivo", "Santiago", "Valparaíso"],
    answer: 1
  },
  {
    id: 'r4',
    question: "¿Cómo se llama uno de los criaderos más reconocidos de la zona que ha participado en Clasificatorios?",
    options: ["Criadero El Olivo", "Criadero Santa Isabel", "Criadero Palmas de Peñaflor", "Criadero Los Huasos"],
    answer: 0
  },
  {
    id: 'r5',
    question: "En el rodeo chileno, ¿cuál es el puntaje ideal que se busca en una atajada de Ijar?",
    options: ["2 puntos", "4 puntos", "0 puntos", "1 punto"],
    answer: 1
  },
  {
    id: 'r6',
    question: "¿Qué vestimenta es tradicional del huaso chileno en el rodeo?",
    options: ["Traje de gala", "Chamanto y chupalla", "Uniforme militar", "Poncho andino"],
    answer: 1
  },
  {
    id: 'r7',
    question: "¿Qué animal es protagonista principal en el rodeo chileno?",
    options: ["Caballo", "Toro", "Vaca", "Oveja"],
    answer: 2
  },
  {
    id: 'r8',
    question: "¿Cuántos jinetes componen una collera en el rodeo chileno?",
    options: ["Uno", "Dos", "Tres", "Cuatro"],
    answer: 1
  },
  {
    id: 'r9',
    question: "¿Qué nombre recibe la pista semicircular donde se realizan las atajadas?",
    options: ["Cancha", "Medialuna", "Picadero", "Corral"],
    answer: 1
  },
  {
    id: 'r10',
    question: "El rodeo chileno es considerado oficialmente como:",
    options: ["Deporte extremo", "Tradición local", "Deporte nacional de Chile", "Actividad recreativa"],
    answer: 2
  }
];


export const ALL_QUESTIONS: Question[] = [...CULTURA_GENERAL, ...FUTBOL_CATEMU, ...RODEO_CATEMU];
export const DEFAULT_QUESTIONS = CULTURA_GENERAL;
