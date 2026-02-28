import path from 'path'
import { fileURLToPath } from 'url'

import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  AlignFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  RelationshipFeature,
} from '@payloadcms/richtext-lexical'
import { r2Storage } from '@payloadcms/storage-r2'
import { buildConfig } from 'payload'
import { authjsPlugin } from 'payload-authjs'
import { GetPlatformProxyOptions } from 'wrangler'

import { getAuthConfig } from './auth.config'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isCLI = process.argv.some((value) => value.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [Articles, Media, Questions, Users],
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => {
        const unwantedFeatures = [AlignFeature, IndentFeature, ChecklistFeature, RelationshipFeature]
        return !unwantedFeatures.some(Unwanted => feature.constructor === Unwanted)
      }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  }),
  globals: [
    ContractorsPage,
    HomePage,
    QuestionsPage,
    ContractingPage,
    RecruitmentPage,
    ArticlesPage,
    PrivacyPage,
    ProjectsPage,
  ],
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'lt'],
  },
  logger: { // https://github.com/payloadcms/payload/issues/14849
    destination: process.stdout,
    options: {
      level: "info",
      transport: undefined,
      browser: {
        asObject: true,
        write: (o) => console.log(JSON.stringify(o)),
      },
      hooks: {
        logMethod(this: any, args: any, method: any, level: number) {
          const consoleFn =
            level >= 50
              ? console.error
              : level >= 40
                ? console.warn
                : level >= 20
                  ? console.log
                  : console.debug;

          consoleFn(...args);
        },
      },
    },
  },
  plugins: [
    authjsPlugin({
      authjsConfig: getAuthConfig(),
    }),
    mcpPlugin({
      collections: {
        articles: {
          enabled: {
            create: true,
            delete: true,
            find: true,
            update: true,
          },
        },
        media: {
          enabled: {
            create: false,
            delete: false,
            find: true,
            update: false,
          },
        },
        questions: {
          enabled: {
            create: true,
            delete: true,
            find: true,
            update: true,
          },
        },
      },
    }),
    seoPlugin({
      collections: ['articles'],
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
      tabbedUI: true,
      uploadsCollection: 'media',
    }),
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
  routes: {
    admin: '/admin',
    api: '/api',
    graphQL: '/api/graphql',
    graphQLPlayground: '/api/graphql-playground',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
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
