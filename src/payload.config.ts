import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { authjsPlugin } from 'payload-authjs'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Articles } from './collections/Articles'
import { Media } from './collections/Media'
import { Questions } from './collections/Questions'
import { Users } from './collections/Users'
import { ArticlesPage } from './globals/ArticlesPage'
import { ContractingPage } from './globals/ContractingPage'
import { ContractorsPage } from './globals/ContractorsPage'
import { HomePage } from './globals/HomePage'
import { PrivacyPage } from './globals/PrivacyPage'
import { ProjectsPage } from './globals/ProjectsPage'
import { QuestionsPage } from './globals/QuestionsPage'
import { RecruitmentPage } from './globals/RecruitmentPage'
import { getAuthConfig } from './auth.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value).endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const normalizePublicSiteUrl = (value: string): string => {
  const trimmed = (value || 'https://itskillhouse.com').trim().replace(/\/+$/, '')
  if (!trimmed) {
    return 'https://itskillhouse.com'
  }

  try {
    const url = new URL(trimmed)
    const normalizedPath = url.pathname
      .replace(/\/+$/, '')
      .replace(/\/cms$/i, '')
      .replace(/\/admin$/i, '')

    const path = normalizedPath && normalizedPath !== '/' ? normalizedPath : ''
    return `${url.origin}${path}`
  } catch {
    return 'https://itskillhouse.com'
  }
}

const publicSiteUrl = normalizePublicSiteUrl(process.env.PUBLIC_SITE_URL || 'https://itskillhouse.com')

const globalPathBySlug: Record<string, string> = {
  'articles-page': '/news',
  'contracting-page': '/contracting',
  'contractors-page': '/contractors',
  'home-page': '/',
  'privacy-page': '/privacy',
  'projects-page': '/projects',
  'questions-page': '/faq',
  'recruitment-page': '/recruitment',
}

const richTextToPlainText = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return ''
  }

  const parts: string[] = []
  const stack: unknown[] = [value]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || typeof current !== 'object') {
      continue
    }

    const record = current as Record<string, unknown>
    const text = record.text
    if (typeof text === 'string' && text.trim().length > 0) {
      parts.push(text.trim())
    }

    const children = record.children
    if (Array.isArray(children)) {
      for (const child of children) {
        stack.push(child)
      }
    }

    const root = record.root
    if (root && typeof root === 'object') {
      stack.push(root)
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

const limitText = (value: string, max: number): string => {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

const pickFirstText = (...values: Array<unknown>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }

    if (value && typeof value === 'object') {
      const fromRichText = richTextToPlainText(value)
      if (fromRichText) {
        return fromRichText
      }
    }
  }

  return ''
}

const toLabelText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    const labels = Object.values(value as Record<string, unknown>)
    const firstString = labels.find((label) => typeof label === 'string')
    if (typeof firstString === 'string') {
      return firstString
    }
  }

  return ''
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    }
  },
  collections: [Articles, Media, Questions, Users],
  routes: {
    admin: '/admin',
    api: '/api',
    graphQL: '/api/graphql',
    graphQLPlayground: '/api/graphql-playground',
  },
  globals: [
    ArticlesPage,
    ContractingPage,
    ContractorsPage,
    HomePage,
    PrivacyPage,
    ProjectsPage,
    QuestionsPage,
    RecruitmentPage,
  ],
  localization: {
    locales: ['en', 'lt'],
    defaultLocale: 'en',
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature(), InlineToolbarFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  plugins: [
    authjsPlugin({
      authjsConfig: getAuthConfig(),
    }),
    seoPlugin({
      collections: ['articles'],
      generateDescription: ({ doc }) => {
        const description = pickFirstText(
          doc?.['meta']?.['description'],
          doc?.['intro'],
          doc?.['excerpt'],
          doc?.['subtitle'],
          doc?.['body'],
          doc?.['answer'],
        )

        return limitText(description || 'IT Skill House services and content.', 155)
      },
      generateImage: ({ doc }) => {
        const metaImage = doc?.['meta']?.['image']
        if (typeof metaImage === 'number' || typeof metaImage === 'string') {
          return metaImage
        }
        if (metaImage && typeof metaImage === 'object' && 'id' in (metaImage as Record<string, unknown>)) {
          return (metaImage as Record<string, unknown>).id as number | string
        }

        const heroImage = doc?.['heroImage']
        if (typeof heroImage === 'number' || typeof heroImage === 'string') {
          return heroImage
        }
        if (heroImage && typeof heroImage === 'object' && 'id' in (heroImage as Record<string, unknown>)) {
          return (heroImage as Record<string, unknown>).id as number | string
        }

        return ''
      },
      generateTitle: ({ collectionConfig, doc, globalConfig }) => {
        const collectionLabel = toLabelText(collectionConfig?.labels?.singular)
        const globalLabel = toLabelText(globalConfig?.label)
        const baseTitle =
          pickFirstText(doc?.['meta']?.['title'], doc?.['title'], doc?.['question']) ||
          globalLabel ||
          collectionLabel

        if (!baseTitle) {
          return 'IT Skill House'
        }

        if (baseTitle.includes('IT Skill House')) {
          return baseTitle
        }

        return `${baseTitle} | IT Skill House`
      },
      generateURL: ({ collectionConfig, doc, globalConfig }) => {
        const globalSlug = globalConfig?.slug
        if (globalSlug) {
          const path = globalPathBySlug[globalSlug]
          if (path) {
            return `${publicSiteUrl}${path}`
          }
        }

        const collectionSlug = collectionConfig?.slug
        if (collectionSlug === 'articles') {
          const articleSlug = pickFirstText(doc?.['slug'])
          if (articleSlug) {
            return `${publicSiteUrl}/news/${articleSlug}`
          }
          return `${publicSiteUrl}/news`
        }

        if (collectionSlug === 'questions') {
          return `${publicSiteUrl}/faq`
        }

        return publicSiteUrl
      },
      globals: [
        'articles-page',
        'contracting-page',
        'contractors-page',
        'home-page',
        'privacy-page',
        'projects-page',
        'questions-page',
        'recruitment-page',
      ],
      uploadsCollection: 'media',
      tabbedUI: true,
    }),
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
