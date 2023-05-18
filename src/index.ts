import 'reflect-metadata'

import { DIService, tsyringeDependencyRegistryEngine } from 'discordx'
import { container, instanceCachingFactory } from 'tsyringe'

import { loadEnv } from './env'
import { Main } from './main'

loadEnv()

DIService.engine = tsyringeDependencyRegistryEngine
  .setUseTokenization(true)
  .setCashingSingletonFactory(instanceCachingFactory)
  .setInjector(container)

Main.start()
