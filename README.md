# Landing page — Clínica de harmonização facial e estética dental

Site de página única em HTML, CSS e JavaScript, sem build e sem dependências para instalar.
O objetivo é levar o visitante até o primeiro contato pelo WhatsApp.

## Como rodar

Abra o `index.html` no navegador. Para testar o mapa do Google e o carregamento das imagens
como em produção, use um servidor local:

```bash
python -m http.server 5500
```

Depois acesse `http://127.0.0.1:5500/`.

## Estrutura

```
index.html      conteúdo e marcação de todas as seções
css/style.css   estilos, incluindo as versões para tablet e celular
js/main.js      menu, mapa de procedimentos, antes e depois, carrossel e animações
```

Bibliotecas usadas via CDN, com versão fixa: GSAP 3.15 (animações e ScrollTrigger),
SplitText (animação do título) e Lenis 1.3 (rolagem suave). Se o CDN não carregar,
o conteúdo continua visível e o site funciona sem as animações.

## O que precisa ser trocado antes de publicar

1. **Número do WhatsApp:** constante `WHATSAPP_NUMBER`, no topo de `js/main.js`. Todos os
   botões do site são montados a partir dela.
2. **Dados da profissional:** nome, CRO, endereço, horários e `@instagram` estão no
   `index.html` (inclusive no bloco de dados estruturados, no `<head>`).
3. **Fotos:** todas as imagens são de banco de imagens (Unsplash) e servem de referência.
   Devem ser substituídas por fotos reais da profissional e da clínica.
4. **Depoimentos:** os textos atuais são fictícios. Precisam ser trocados por depoimentos
   reais antes de o site entrar no ar.
5. **Antes e depois:** as fotos são ilustrativas. Cada caso usa `data-before` e `data-after`
   na seção de casos clínicos. Publique apenas casos reais, com Termo de Autorização de Uso
   de Imagem assinado pelo paciente, como exige o CFO. Ao trocar, atualize também o aviso
   em `.results__note`.
6. **Mapa de procedimentos:** a posição de cada ponto vem dos valores `--x` e `--y`, em
   porcentagem, no próprio HTML. Se trocar a foto do rosto ou do sorriso, reposicione os pontos.

## Acessibilidade e desempenho

- Quem ativa "reduzir movimento" no sistema recebe o site sem animações.
- Imagens abaixo da dobra usam carregamento tardio e têm largura e altura definidas.
- Navegação por teclado e textos alternativos nas imagens de conteúdo.
