import fs from 'fs-extra'
import rawFs from 'fs'
import sqlite3 from 'sqlite3'
import moment from 'moment'
import del from 'node-delete'
import jsonfile from 'jsonfile'

const BEAR_PATH = '/Users/MookCake/Library/Containers/net.shinyfrog.bear/Data/Library/Application\ Support/net.shinyfrog.bear'
const NOTE_DATABASE = `${BEAR_PATH}/database.sqlite`
const NOTE_IMAGES_PATH = `${BEAR_PATH}/Local\ Files/Note\ Images`
const itemsDescriptions = jsonfile.readFileSync('./parse-seo.json')

const sqlite = sqlite3.verbose()
const db = new sqlite.Database(NOTE_DATABASE)

const promisify = (target, methods) => {
  methods.forEach((method) => {
    const oldMethod = target[method]
    target[method] = (...args) => new Promise((resolve, reject) => {
      oldMethod.apply(target, [...args, (err, rets) => {
        if (err) {
          console.log('ERROR', err)
          reject(err)
        } else {
          resolve(rets)
        }
      }])
    })
  })
}

const util = { del }
promisify(db, ['run', 'all', 'serialize'])
promisify(fs, ['writeFile', 'exists', 'copy', 'access'])
promisify(util, ['del'])
const LESSON_REGX = /(#\s+Lesson\s+([\d\.]+))([:：])([\s\S]+?)\n/
const TAG_REGX = /#React.js教程#/

const start = async () => {
  await db.serialize()
  let notes = await db.all("SELECT * FROM ZSFNOTE")
  await util.del('./_posts/*.md')
  notes = notes
    .filter((note) => note.ZSUBTITLE.match(TAG_REGX))
    .map(generateNoteObj)
    .sort((a, b) => a.num - b.num)
    .map(generatePost)
  console.log('\n')
  await Promise.all(notes)
  console.log('\n DONE!')
}

const generateNoteObj = (rawNote, i) => {
  const note = rawNote.ZTEXT
  const lessonCaptures = note.match(LESSON_REGX)
  const num = +lessonCaptures[2]
  const title = lessonCaptures[4].trim()
  const text = note
    .replace(LESSON_REGX, '')
    .replace(TAG_REGX, '')
    .trim()
    .replace(/‘|’/g, '\'')
    .replace(/\t/g, '  ')
  checkTODOsIfExist(text, title)
  return { num, title, text }
}

const checkTODOsIfExist = (content, title) => {
  if (content.match(/TODO/)) {
    console.warn(`WARNING: 文章 "${title}" 存在未完成内容！`)
  }
}

const DATE_FORMAT = 'YYYY-MM-DD'
const TEXT_PREFIX = (title, i) =>  {
  const item = itemsDescriptions[i] || {}
  const description = item.description || 'React.js 小书是一个开源、免费、专业、简单的 React.js 在线教程。提炼实战经验中基础的、重要的、频繁的知识进行重点讲解，让你能用最少的精力深入了解实战中最需要的 React.js 知识。'
  const keywords = item.keywords || 'react.js,web,props,state,javascript'
return `---
layout: post
title: ${title}
description: ${description}
tags: [${keywords}]
---

<ul style='font-size: 14px;'>
  <li>
    作者：<a href="https://www.zhihu.com/people/hu-zi-da-ha" target="_blank">胡子大哈</a>
  </li>
  <li>
    原文链接：<a href="http://huziketang.com/books/react{{ page.url }}"> http://huziketang.com/books/react{{ page.url }} </a>
  </li>
  <li>转载请注明出处，保留原文链接和作者信息。</li>
</ul>

`
}
const IMAGE_REGX = /\[image:([\w\d\-]+\/([\w\d\.\-]+.png))\]/g
const IMAGE_REGX_EACH = /\[image:([\w\d\-]+\/([\w\.\d\-]+.png))\]/

const generatePost = async (note, i) => {
  const date = getDate(i)
  const postName = `./_posts/${date}-lesson${i + 1}.md`
  await copyImagesForNote(note)
  replaceImageTag(note, i)
  console.log('Creating post', note.title)
  return fs.writeFile(
    postName,
    `${TEXT_PREFIX(note.title, i)}${note.text}`,
    'utf-8'
  )
}

const getDate = (i) => {
  return moment('2017-02-20')
    .day(i)
    .format(DATE_FORMAT)
}

const copyImagesForNote = (note) => {
  const captures = note.text.match(IMAGE_REGX)
  if (!captures) return []
  return Promise.all(captures
    .map((imgStr) => {
      const cap = imgStr.match(IMAGE_REGX_EACH)
      return {
        dest: `./assets/img/posts/${cap[2]}`,
        src: `${NOTE_IMAGES_PATH}/${cap[1]}`
      }
    })
    .map(checkIfExistsAndCopy)
  )
}

// const REMOTE_IMG_PATH = 'http://huzidaha.github.io/react-naive-book/assets/img/posts/'
const REMOTE_IMG_PATH = 'http://huziketang.com/books/react/assets/img/posts/'
const replaceImageTag = (note, i) => {
  const item = itemsDescriptions[i] || { alt: '实例图片' }
  note.text = note.text.replace(IMAGE_REGX, `<a href="${REMOTE_IMG_PATH}$2" target="_blank">![${item.alt}](${REMOTE_IMG_PATH}$2)</a>`)
}

const checkIfExistsAndCopy = async (obj) => {
  if (
    fs.existsSync(obj.src) &&
    !fs.existsSync(obj.dest)
  ) {
    console.log('Copying file', obj.dest)
    return fs.copy(obj.src, obj.dest)
  }
}

start().catch((e) => {
  console.log(e.message, e.stack)
})
