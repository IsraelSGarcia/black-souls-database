const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;

if (!TOKEN || !REPO) {
    console.error('ERRO: GITHUB_TOKEN e GITHUB_REPOSITORY são necessários no ambiente.');
    process.exit(1);
}

const [owner, name] = REPO.split('/');

const query = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    discussions(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        title
        bodyText
        createdAt
        url
        author {
          login
          avatarUrl
        }
        comments(last: 10) {
          nodes {
            bodyText
            createdAt
            updatedAt
            upvoteCount
            author {
              login
              avatarUrl
            }
            reactionGroups {
              content
              reactors {
                totalCount
              }
            }
            replies(last: 10) {
              nodes {
                bodyText
                createdAt
                updatedAt
                upvoteCount
                author {
                  login
                  avatarUrl
                }
                reactionGroups {
                  content
                  reactors {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

// Carrega processed-data.json para conseguir traduzir os IDs em nomes
let dbData = null;
try {
    const processedDataPath = path.join(__dirname, 'processed-data.json');
    if (fs.existsSync(processedDataPath)) {
        dbData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
        console.log('✓ processed-data.json carregado com sucesso.');
    } else {
        console.warn('⚠️ processed-data.json não encontrado. Os nomes dos itens serão exibidos em formato bruto.');
    }
} catch (e) {
    console.error('❌ Erro ao carregar processed-data.json:', e);
}

// Converte os termos do Giscus (ex: bs2-skills-12) em caminhos amigáveis e nomes
function resolveItemName(term) {
    if (term === 'home') {
        return { name: 'Home (General Comments)', link: '#/' };
    }
    if (term === 'bs2-home') {
        return { name: 'Black Souls II (Main Menu)', link: '#/bs2' };
    }
    
    const match = term.match(/^bs2-([a-z]+)-(general|\d+)$/);
    if (match) {
        const section = match[1];
        const idOrGeneral = match[2];
        
        const sectionDisplayNames = {
            skills: 'Skill',
            states: 'State',
            weapons: 'Weapon',
            armors: 'Armor',
            enemies: 'Enemy',
            items: 'Item',
            elements: 'Element',
            stats: 'Stats'
        };

        if (idOrGeneral === 'general') {
            return { 
                name: `${sectionDisplayNames[section] || section} (Overview)`, 
                link: `#/${section}` 
            };
        }
        
        const id = parseInt(idOrGeneral);
        if (dbData && dbData[section]) {
            const item = dbData[section].find(i => i.id === id);
            if (item) {
                const sectionName = sectionDisplayNames[section] || section;
                return { 
                    name: `${item.name} (${sectionName})`, 
                    link: `#/${section}/${id}` 
                };
            }
        }
        return { name: `${sectionDisplayNames[section] || section} #${id}`, link: `#/${section}/${id}` };
    }
    return { name: term, link: '#/' };
}

async function run() {
    try {
        console.log(`Buscando discussões para o repositório: ${owner}/${name}...`);
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'node-fetch'
            },
            body: JSON.stringify({
                query,
                variables: { owner, name }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Resposta da API do GitHub: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        if (result.errors) {
            throw new Error(`Erros GraphQL: ${JSON.stringify(result.errors)}`);
        }

        const discussions = result.data.repository.discussions.nodes;
        const allActivity = [];

        const emojiMap = {
            THUMBS_UP: '👍',
            THUMBS_DOWN: '👎',
            LAUGH: '😄',
            HOORAY: '🎉',
            CONFUSED: '😕',
            HEART: '❤️',
            ROCKET: '🚀',
            EYES: '👀'
        };

        function getReactions(node) {
            const reactions = [];
            if (node.reactionGroups) {
                node.reactionGroups.forEach(rg => {
                    if (rg.reactors && rg.reactors.totalCount > 0) {
                        reactions.push({
                            emoji: emojiMap[rg.content] || rg.content,
                            count: rg.reactors.totalCount
                        });
                    }
                });
            }
            return reactions;
        }

        discussions.forEach(disc => {
            // Filtrar apenas discussões criadas pela nossa database
            const term = disc.title;
            const isDatabaseDiscussion = term === 'home' || term === 'bs2-home' || /^bs2-[a-z]+-(general|\d+)$/.test(term);
            
            if (!isDatabaseDiscussion) return;

            const resolved = resolveItemName(term);

            // 2. Adiciona as respostas/comentários internos
            if (disc.comments && disc.comments.nodes) {
                disc.comments.nodes.forEach(comment => {
                    const commentDate = comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt)
                        ? comment.updatedAt 
                        : comment.createdAt;
                        
                    if (comment.author) {
                        allActivity.push({
                            author: comment.author.login,
                            avatarUrl: comment.author.avatarUrl,
                            text: comment.bodyText,
                            date: commentDate,
                            itemName: resolved.name,
                            link: resolved.link,
                            upvoteCount: comment.upvoteCount || 0,
                            reactions: getReactions(comment)
                        });
                    }
                    
                    // Adiciona as réplicas/respostas internas (replies)
                    if (comment.replies && comment.replies.nodes) {
                        comment.replies.nodes.forEach(reply => {
                            const replyDate = reply.updatedAt && new Date(reply.updatedAt) > new Date(reply.createdAt)
                                ? reply.updatedAt 
                                : reply.createdAt;
                                
                            if (reply.author) {
                                allActivity.push({
                                    author: reply.author.login,
                                    avatarUrl: reply.author.avatarUrl,
                                    text: reply.bodyText,
                                    date: replyDate,
                                    itemName: resolved.name,
                                    link: resolved.link,
                                    upvoteCount: reply.upvoteCount || 0,
                                    reactions: getReactions(reply)
                                });
                            }
                        });
                    }
                });
            }
        });

        // Ordena por data decrescente (mais recente primeiro)
        allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Pega as 5 mais recentes
        const recentComments = allActivity.slice(0, 5);

        // Salva o JSON no mesmo diretório
        const outputPath = path.join(__dirname, 'recent-comments.json');
        fs.writeFileSync(outputPath, JSON.stringify(recentComments, null, 2));
        
        console.log(`✓ recent-comments.json gerado com sucesso com ${recentComments.length} comentários recentes.`);
    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
        process.exit(1);
    }
}

run();
