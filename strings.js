// ═══════════════════════════════════════════════════════════════════════════
// FLOR DE SAL — game strings
// i18n source of record. Loaded AFTER data.js. PT (primary) + EN; default PT
// (set at the bottom); langButtons:'auto' shows a PT/EN toggle. Lang.t falls back
// PT→EN→key, so every key exists in BOTH tables.
//
// The closing message appears only at the finale (never teased earlier), rendered
// standalone with its own signature. Catchphrases kept in voice: "Devagar se vai
// ao longe" (Guida's motto), "os meus solinhos" (her marigolds), the free last
// bunch, Joaquim's fig tree, Feijao + the dahlias, Teo's peony/poppy, Bento's
// twenty years of fines, Dona Rosa at the market.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

Lang.strings = {
  pt: {
    // ─── UI ───
    title: 'Flor de Sal',
    subtitle: 'Quarenta anos de flores. Uma última volta pela loja.',
    lvl1: 'Nível 1: A Loja — Flor de Sal',
    lvl2: 'Nível 2: O Jardim Comunitário',
    lvl3: 'Nível 3: A Praça — A Festa',
    press_space: '[ESPAÇO ou CLIQUE]',
    paused: 'PAUSA', resume: 'Voltar [ESC]', restart_act: 'Recomeçar o ato [R]', quit_title: 'Sair para o início [Q]',
    game_over: 'Respira fundo. Tenta outra vez.', retry_act: 'Voltar ao ato [R]',
    the_end: 'OBRIGADA, GUIDA!',
    credits: 'Flor de Sal · quarenta anos a fazer a rua mais bonita. Com amor, Inês.',
    credits_party: 'Guida · Teo · Feijão · Senhor Bento · Dona Rosa · Inês',
    press_any: 'Prime ESPAÇO para voltar ao início',
    // ─── Speakers ───
    narrator: 'Narração', guida: 'Guida', teo: 'Teo', bento: 'Senhor Bento', rosa: 'Dona Rosa', feijao: 'Feijão',
    // ═══════════════════════════ NÍVEL 1 — A LOJA ═══════════════════════════
    l1a1_hint: 'Ato 1: rega as três plantas murchas com Z. Devagar se vai ao longe.',
    l1a1_1: 'Flor de Sal, na Rua das Amendoeiras. Quarenta anos a abrir a porta antes do sol. Hoje, a Guida vem só arrumar.',
    l1a1_2: 'Teo: Avó, deixa que eu ajudo. Setas para andar, ESPAÇO para saltar. E a tua regadeira verde de sempre no Z.',
    l1a1_tut: 'SETAS/WASD andar · ESPAÇO saltar · Z regar · Q semear os solinhos · K passo rápido',
    l1a1_3: 'Guida: Sem pressa, filho. Devagar se vai ao longe. Cada planta a seu tempo.',
    l1a1_4: 'Teo: Aquelas três ali estão a pedir água. Chega-te ao pé e rega com Z — vais ver que reviram logo.',
    l1a1_win: 'As três plantas erguem as folhas, viçosas. A loja cheira a terra molhada e a calêndula.',
    l1a1_win2: 'Guida: Os meus solinhos. Prontos para mais um dia.',
    l1a2_hint: 'Ato 2: enxota os pulgões dos baldes com Z. Depois, a última rama do dia.',
    l1a2_1: 'Hora de fechar. Uns pulgões meteram-se entre os baldes de flores. Nada que um toque não resolva.',
    l1a2_2: 'Guida: Fora daqui, gulosos. Estas flores já têm dono.',
    l1a2_win: 'Com os baldes limpos, a Guida escolhe a rama mais bonita e pendura-a à porta — de graça, como sempre.',
    l1a2_win2: 'Guida: A última rama do dia é sempre para quem passar. Agora, ao jardim.',
    // ═══════════════════════════ NÍVEL 2 — O JARDIM ═══════════════════════════
    l2a1_hint: 'Ato 1: atravessa os canteiros até à figueira. Salta com ESPAÇO.',
    l2a1_1: 'O jardim comunitário à hora dourada. Os canteiros altos, os vasos de barro, e ao fundo — a figueira.',
    l2a1_2: 'Guida: O Joaquim plantou aquela figueira há quarenta anos. Dá sombra a meia rua. Anda, Feijão.',
    l2a1_win: 'A Guida chega à figueira e encosta a mão ao tronco quente. O Feijão rói uma folha, todo contente.',
    l2a1_win2: 'Guida: Ainda cá está, teimosa como o dono. Mas... onde é que aquele bode se meteu agora?',
    l2a2_hint: 'Ato 2: enxota os escaravelhos das dálias com Z e chama o Feijão de volta.',
    l2a2_1: 'O Feijão soltou-se outra vez — mesmo no meio das dálias premiadas! E os escaravelhos aproveitaram a confusão.',
    l2a2_2: 'Guida: Todas as primaveras a mesma história. Vá, limpa-me isto — eu trato do bode.',
    l2a2_win: 'Limpas as dálias, a Guida estende uma calêndula. O Feijão trota até ela, manso, e segue-a rua fora.',
    l2a2_win2: 'Guida: Sempre foste guloso por um solinho. Anda — dizem que há festa na praça.',
    // ═══════════════════════════ NÍVEL 3 — A PRAÇA ═══════════════════════════
    l3a1_hint: 'Ato 1: a praça ao entardecer. Ouve o Senhor Bento.',
    l3a1_1: 'A praça ao entardecer, as luzes acesas, a fonte a cantar. Estão a montar qualquer coisa... e alguém barra o caminho.',
    l3a1_2: 'Senhor Bento: Alto! Não se montam flores nesta praça sem licença. Vinte anos que lho digo, Dona Margarida.',
    l3a1_3: 'Guida: E vinte anos que lhe respondo o mesmo, Bento: uma flor nunca fez mal a ninguém.',
    l3a1_4: 'Vinte anos de multas pelos baldes no passeio. Vinte anos de a Guida os pôr no dia seguinte na mesma.',
    l3a1_5: 'Senhor Bento: Hoje não passa. Faça-me o favor — mostre lá essa teimosia uma última vez.',
    l3a2_hint: 'Ato 2: o Senhor Bento não arreda pé. Mostra-lhe a tua arte com Z e Q.',
    l3a2_1: 'O Senhor Bento levanta o livro das multas como quem levanta um bastão. A caneta em riste.',
    l3a2_2: 'Guida: Está bem, Bento. Uma última dança, você e eu.',
    l3_bento_enter: 'Bento: Regulamento é regulamento!',
    l3_bento_1: 'Bento: Isto vai levar multa!',
    l3_bento_2: 'Bento: Onde está a licença?!',
    l3_bento_3: 'Bento: Teimosa como sempre...',
    l3a2_concede_1: 'O Senhor Bento baixa o livro. Fica muito tempo calado. Depois, mete a mão dentro do casaco.',
    l3a2_concede_2: 'Senhor Bento: Quarenta anos... e a rua nunca cheirou tão bem. Tome. Guardei-as para hoje.',
    l3a2_concede_3: 'Senhor Bento: Calêndulas. Do meu quintal. Sempre gostei das suas, Dona Margarida. Só nunca soube dizer.',
    l3a2_concede_4: 'No fim, o fiscal mais rezingão da vila era o maior admirador da florista. Sempre foi.',
    l3a3_hint: 'A festa da reforma. Toda a rua veio.',
    l3a3_1: 'Rompem os aplausos. Toda a Rua das Amendoeiras encheu a praça. Serpentinas, luzes, e um fado ao longe.',
    l3a3_2: 'Dona Rosa: Quarenta anos ao teu lado na banca, Guida! A praça não seria a praça sem as tuas flores.',
    l3a3_3: 'Teo: A loja fica em boas mãos, avó. Prometo — um dia até distingo a peónia da papoila.',
    l3a3_4: 'O Feijão irrompe pela praça com uma coroa de calêndulas na cabeça. A Guida ri-se até saltarem lágrimas. Então, o Teo estende-lhe um envelope.',
    l3a3_ines: 'Mãe — quarenta anos de flores, e a rua toda mais bonita por sua causa. Agora é a sua vez de sentar ao sol. Com todo o amor, Inês.',
    l3a3_5: 'Guida: Devagar se foi ao longe, afinal. Quarenta anos... e valeu cada manhã.',
    l3a3_6: 'A rua inteira levanta a Guida aos ombros, entre calêndulas e luzes. A Flor de Sal fecha a porta — e a rua fica mais bonita para sempre.',
  },
  en: {
    // ─── UI ───
    title: 'Flor de Sal',
    subtitle: 'Forty years of flowers. One last turn around the shop.',
    lvl1: 'Level 1: The Shop — Flor de Sal',
    lvl2: 'Level 2: The Community Garden',
    lvl3: 'Level 3: The Plaza — The Party',
    press_space: '[SPACE or CLICK]',
    paused: 'PAUSED', resume: 'Resume [ESC]', restart_act: 'Restart act [R]', quit_title: 'Quit to title [Q]',
    game_over: 'Take a breath. Try again.', retry_act: 'Back to it [R]',
    the_end: 'THANK YOU, GUIDA!',
    credits: 'Flor de Sal · forty years making the street more beautiful. With love, Inês.',
    credits_party: 'Guida · Teo · Feijão · Senhor Bento · Dona Rosa · Inês',
    press_any: 'Press SPACE for the title',
    // ─── Speakers ───
    narrator: 'Narrator', guida: 'Guida', teo: 'Teo', bento: 'Senhor Bento', rosa: 'Dona Rosa', feijao: 'Feijão',
    // ═══════════════════════════ LEVEL 1 — THE SHOP ═══════════════════════════
    l1a1_hint: 'Act 1: water the three wilted plants with Z. Slow and steady goes far.',
    l1a1_1: 'Flor de Sal, on Rua das Amendoeiras. Forty years opening the door before sunrise. Today, Guida just comes to tidy up.',
    l1a1_2: 'Teo: Let me help, Avó. Arrows to walk, SPACE to jump. And your same old green watering can on Z.',
    l1a1_tut: 'ARROWS/WASD move · SPACE jump · Z water · Q sow the little suns · K quick step',
    l1a1_3: 'Guida: No rush, love. Slow and steady goes far. Each plant in its own time.',
    l1a1_4: 'Teo: Those three there are begging for water. Step up close and water them with Z — you\'ll see them perk right up.',
    l1a1_win: 'All three plants lift their leaves, lush again. The shop smells of wet soil and marigold.',
    l1a1_win2: 'Guida: My little suns. Ready for one more day.',
    l1a2_hint: 'Act 2: shoo the aphids off the buckets with Z. Then, the last bunch of the day.',
    l1a2_1: 'Closing time. A few aphids got in among the flower buckets. Nothing a tap won\'t fix.',
    l1a2_2: 'Guida: Off you go, greedy things. These flowers are already spoken for.',
    l1a2_win: 'With the buckets clean, Guida picks the prettiest bunch and hangs it by the door — free, like always.',
    l1a2_win2: 'Guida: The last bunch of the day is always for whoever walks by. Now, to the garden.',
    // ═══════════════════════════ LEVEL 2 — THE GARDEN ═══════════════════════════
    l2a1_hint: 'Act 1: cross the flower beds to the fig tree. Jump with SPACE.',
    l2a1_1: 'The community garden at golden hour. The raised beds, the terracotta pots, and at the far end — the fig tree.',
    l2a1_2: 'Guida: Joaquim planted that fig tree forty years ago. It shades half the street. Come on, Feijão.',
    l2a1_win: 'Guida reaches the fig tree and rests her hand on the warm trunk. Feijão nibbles a leaf, content.',
    l2a1_win2: 'Guida: Still here, stubborn as the man who planted it. But... where has that goat gone off to now?',
    l2a2_hint: 'Act 2: shoo the beetles off the dahlias with Z, and call Feijão back.',
    l2a2_1: 'Feijão got loose again — right in the middle of the prize dahlias! And the beetles seized on the chaos.',
    l2a2_2: 'Guida: Every spring, the same story. Go on, clear these off — I\'ll handle the goat.',
    l2a2_win: 'The dahlias clear, Guida holds out a marigold. Feijão trots over, gentle now, and follows her down the street.',
    l2a2_win2: 'Guida: Always had a soft spot for a little sun. Come — they say there\'s a party in the plaza.',
    // ═══════════════════════════ LEVEL 3 — THE PLAZA ═══════════════════════════
    l3a1_hint: 'Act 1: the plaza at dusk. Hear Senhor Bento out.',
    l3a1_1: 'The plaza at dusk, the lights lit, the fountain singing. They\'re setting something up... and someone\'s blocking the way.',
    l3a1_2: 'Senhor Bento: Halt! You don\'t set up flowers in this plaza without a permit. Twenty years I\'ve told you, Dona Margarida.',
    l3a1_3: 'Guida: And twenty years I\'ve given you the same answer, Bento: a flower never hurt anyone.',
    l3a1_4: 'Twenty years of fines for the buckets on the sidewalk. Twenty years of Guida setting them right back out the next day.',
    l3a1_5: 'Senhor Bento: Not today. Do me the honor — show me that stubbornness one last time.',
    l3a2_hint: 'Act 2: Senhor Bento won\'t budge. Show him your art with Z and Q.',
    l3a2_1: 'Senhor Bento raises his citation book like a bat. Pen at the ready.',
    l3a2_2: 'Guida: Alright, Bento. One last dance, you and me.',
    l3_bento_enter: 'Bento: Rules are rules!',
    l3_bento_1: 'Bento: This is getting a fine!',
    l3_bento_2: 'Bento: Where\'s the permit?!',
    l3_bento_3: 'Bento: Stubborn as ever...',
    l3a2_concede_1: 'Senhor Bento lowers the book. He\'s quiet a long moment. Then he reaches inside his coat.',
    l3a2_concede_2: 'Senhor Bento: Forty years... and the street never smelled so sweet. Here. I saved these for today.',
    l3a2_concede_3: 'Senhor Bento: Marigolds. From my own yard. I always liked yours, Dona Margarida. I just never knew how to say it.',
    l3a2_concede_4: 'In the end, the grumpiest inspector in town was the florist\'s biggest admirer. He always was.',
    l3a3_hint: 'The retirement party. The whole street came.',
    l3a3_1: 'Applause breaks out. All of Rua das Amendoeiras has filled the plaza. Streamers, lights, and a fado somewhere far off.',
    l3a3_2: 'Dona Rosa: Forty years beside you at the market, Guida! The plaza wouldn\'t be the plaza without your flowers.',
    l3a3_3: 'Teo: The shop\'s in good hands, Avó. I promise — one day I\'ll even tell a peony from a poppy.',
    l3a3_4: 'Feijão bursts into the plaza with a crown of marigolds on his head. Guida laughs until the tears come. Then Teo hands her an envelope.',
    l3a3_ines: 'Mãe — forty years of flowers, and the whole street is more beautiful because of you. Now it\'s your turn to sit in the sun. With all my love, Inês.',
    l3a3_5: 'Guida: Slow and steady did go far, after all. Forty years... and every morning was worth it.',
    l3a3_6: 'The whole street lifts Guida onto their shoulders, among marigolds and lights. Flor de Sal closes its door — and the street stays more beautiful forever.',
  },
};

// Default to Portuguese (the recipient's language). The title's PT/EN toggle
// (GAME_CONFIG.langButtons:'auto') lets the family switch to EN.
Lang.current = 'pt';
