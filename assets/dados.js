/* Divino Fogão Shopping Barra — dados da demo (localStorage).
   Site e painel leem e gravam aqui, então o que o gerente muda no painel
   aparece no site na hora (mesmo navegador). */
(function () {
  const CHAVE = 'dfb-v1';
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  const PADRAO = {
    loja: {
      nome: 'Divino Fogão Shopping Barra',
      local: 'Praça de Alimentação do Shopping Barra',
      endereco: 'Av. Centenário, 2992 — Chame-Chame, Salvador',
      abre: '11:00', fecha: '22:00',
      whatsapp: '',
      instagram: 'divinofogaoshoppingbarra'
    },
    precos: { livre: 39.99, cem: 12.29 },
    // destaques por dia da semana (0 = domingo). O gerente troca no painel.
    buffet: {
      base: [
        { nome: 'Arroz branco e arroz carreteiro', tipo: 'acomp' },
        { nome: 'Feijão tropeiro', tipo: 'acomp' },
        { nome: 'Purê de batata', tipo: 'acomp' },
        { nome: 'Abóbora recheada gratinada', tipo: 'acomp' },
        { nome: 'Legumes no vapor', tipo: 'salada' },
        { nome: 'Bar de saladas e molhos', tipo: 'salada' },
        { nome: 'Grelhados na hora (frango, linguiça, bife de boi)', tipo: 'prot' },
        { nome: 'Queijo coalho na chapa', tipo: 'prot' },
        { nome: 'Batata frita', tipo: 'acomp' }
      ],
      dia: {
        0: ['Costela assada no bafo', 'Frango caipira', 'Lasanha da casa'],
        1: ['Carne de panela com batata', 'Frango ao molho', 'Macarrão alho e óleo'],
        2: ['Rabada divina com agrião', 'Peixe ao molho de coco', 'Farofa de banana'],
        3: ['Feijoada completa', 'Lombo assado', 'Couve refogada'],
        4: ['Picanha suína', 'Galinha de cabidela', 'Mandioca cozida'],
        5: ['Moqueca de peixe', 'Escondidinho de carne do sol', 'Pirão'],
        6: ['Feijoada caprichada', 'Torresmo', 'Couve e laranja']
      },
      acabou: []
    },
    marmitas: [
      { id: 'm1', nome: 'Marmita Divina', desc: 'Arroz, feijão tropeiro, 1 grelhado à escolha, purê e salada', preco: 32.9, foto: 'assets/grelhados.jpg', ativo: true },
      { id: 'm2', nome: 'Marmita do dia', desc: 'Leva o destaque de hoje do buffet com os acompanhamentos', preco: 36.9, foto: 'assets/rabada.jpg', ativo: true },
      { id: 'm3', nome: 'Filé à parmegiana', desc: 'Arroz, fritas e filé empanado com molho e queijo', preco: 39.9, foto: 'assets/parmegiana.jpg', ativo: true },
      { id: 'm4', nome: 'Marmita leve', desc: 'Frango grelhado, legumes no vapor e salada verde', preco: 29.9, foto: 'assets/saladas.jpg', ativo: true },
      { id: 'm5', nome: 'Feijoada (sábado)', desc: 'Feijoada completa com arroz, couve, farofa e laranja', preco: 38.9, foto: 'assets/feijoada.jpg', ativo: true },
      { id: 'b1', nome: 'Refrigerante lata', desc: 'Coca-Cola, Guaraná ou Zero', preco: 7.0, foto: '', ativo: true, bebida: true },
      { id: 'b2', nome: 'Suco natural 400 ml', desc: 'Laranja, maracujá ou cajá', preco: 10.0, foto: '', ativo: true, bebida: true }
    ],
    pedidos: [],
    lojas: [],
    encomendas: [],
    fidelidade: []
  };

  function hojeISO(off) { const d = new Date(); d.setDate(d.getDate() + (off || 0)); return d.toISOString().slice(0, 10); }
  function hora(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); }

  // exemplos para o painel não abrir vazio
  function semente(db) {
    db.lojas = [
      { id: 'L1', nome: 'Ótica Visão Barra', piso: 'L1', contato: 'Fernanda', tel: '71 98800-1122', pessoas: 6, ativo: true },
      { id: 'L2', nome: 'Loja de calçados (piso L2)', piso: 'L2', contato: 'Rafael', tel: '71 99211-4040', pessoas: 9, ativo: true },
      { id: 'L3', nome: 'Farmácia do corredor sul', piso: 'L1', contato: 'Joana', tel: '71 98123-7788', pessoas: 4, ativo: true }
    ];
    db.pedidos = [
      { id: 'DF-1041', tipo: 'loja', loja: 'L2', cliente: 'Rafael (calçados L2)', tel: '71 99211-4040', itens: [{ id: 'm1', q: 5 }, { id: 'm4', q: 2 }, { id: 'b1', q: 7 }], retirada: '12:00', entrega: 'Entregar na loja', status: 'preparando', criado: hora(10, 12), pago: 'Fatura mensal' },
      { id: 'DF-1042', tipo: 'retirada', cliente: 'Marina S.', tel: '71 98877-6655', itens: [{ id: 'm2', q: 1 }, { id: 'b2', q: 1 }], retirada: '12:30', entrega: 'Retirar no balcão', status: 'novo', criado: hora(11, 2), pago: 'Pix' },
      { id: 'DF-1043', tipo: 'loja', loja: 'L1', cliente: 'Fernanda (Ótica Visão)', tel: '71 98800-1122', itens: [{ id: 'm1', q: 3 }, { id: 'm3', q: 3 }], retirada: '13:00', entrega: 'Entregar na loja', status: 'novo', criado: hora(11, 20), pago: 'Fatura mensal' },
      { id: 'DF-1039', tipo: 'retirada', cliente: 'Carlos A.', tel: '71 99654-1200', itens: [{ id: 'm3', q: 1 }], retirada: '11:45', entrega: 'Retirar no balcão', status: 'pronto', criado: hora(10, 40), pago: 'Cartão no balcão' },
      { id: 'DF-1036', tipo: 'retirada', cliente: 'Luana P.', tel: '71 98100-3434', itens: [{ id: 'm4', q: 2 }], retirada: '11:30', entrega: 'Retirar no balcão', status: 'retirado', criado: hora(10, 5), pago: 'Pix' }
    ];
    db.encomendas = [
      { id: 'E-210', nome: 'Patrícia — RH de escritório no Chame-Chame', tel: '71 99902-1818', tipo: 'Confraternização de fim de ano', pessoas: 35, data: hojeISO(24), obs: 'Buffet livre em mesa reservada, de preferência sexta 12h30', status: 'orçamento enviado', valor: 1399.65 },
      { id: 'E-211', nome: 'Gustavo', tel: '71 98777-0909', tipo: 'Bandejas para levar', pessoas: 20, data: hojeISO(4), obs: '2 bandejas de feijoada + arroz + farofa', status: 'novo', valor: 0 }
    ];
    db.fidelidade = [
      { tel: '71988776655', nome: 'Marina S.', selos: 7, resgates: 0 },
      { tel: '71996541200', nome: 'Carlos A.', selos: 9, resgates: 1 },
      { tel: '71981003434', nome: 'Luana P.', selos: 3, resgates: 0 }
    ];
    return db;
  }

  function carregar() {
    try { const j = localStorage.getItem(CHAVE); if (j) return JSON.parse(j); } catch (e) { }
    const db = semente(JSON.parse(JSON.stringify(PADRAO)));
    salvar(db);
    return db;
  }
  function salvar(db) { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) { } }
  function resetar() { try { localStorage.removeItem(CHAVE); } catch (e) { } return carregar(); }

  const brl = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  function item(db, id) { return db.marmitas.find(m => m.id === id) || { nome: '?', preco: 0 }; }
  function totalPedido(db, p) { return p.itens.reduce((s, i) => s + item(db, i.id).preco * i.q, 0); }
  function destaquesHoje(db, dow) { return db.buffet.dia[dow == null ? new Date().getDay() : dow] || []; }
  function aberto(db) {
    const d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    const [ah, am] = db.loja.abre.split(':').map(Number), [fh, fm] = db.loja.fecha.split(':').map(Number);
    return m >= ah * 60 + am && m < fh * 60 + fm;
  }

  window.DFB = { carregar, salvar, resetar, brl, item, totalPedido, destaquesHoje, aberto, DIAS, hojeISO };
})();
