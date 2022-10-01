const fetch = require('node-fetch')

async function get(url) {
  const res = await fetch(url)
  const data = await res.json()
  return data
}

async function user(username, fn) {
  const u = await get(`https://api.github.com/users/${username}`)
  if (u.message) {
    console.log(u)
    return false
  }
  const rs = await get(u.repos_url)
  let total = 0
  let stats = {
    languages: {}
  }
  for (const r of rs) {
    const langs = await get(r.languages_url)
    for (const [lang, lines] of Object.entries(langs)) {
      total += lines
      if (!stats.languages[lang]) stats.languages[lang] = 0
      stats.languages[lang] += lines
    }
  }
  for (const [lang, lines] of Object.entries(stats.languages)) {
    stats.languages[lang] = `${Math.round((lines / total) * 100)}%`
  }
  fn(u, stats)
}

async function repo(owner, name, fn) {
  const r = await get(`https://api.github.com/repos/${owner}/${name}`)
  if (r.message) {
    console.log(r)
    return false
  }
  fn(r)
}

user('intfract', (u, stats) => {
  const info = {
    username: u.login,
    name: u.name,
    bio: u.bio,
    url: u.html_url,
    avatar: u.avatar_url,
    followers: u.followers,
    repos: u.public_repos,
  }
  console.log(info, stats)
})

repo('intfract', 'defract', (r) => {
  const info = {
    name: r.full_name,
    url: r.html_url,
    owner: {
      username: r.owner.login,
      avatar: r.owner.avatar_url,
    },
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
  }
  console.log(info)
})