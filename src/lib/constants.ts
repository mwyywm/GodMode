import Bard from '../providers/bard';
import Bing from '../providers/bing';
import Claude from '../providers/claude';
import HuggingChat from '../providers/huggingchat';
import OobaBooga from '../providers/oobabooga';
import OpenAi from '../providers/openai';
import Perplexity from '../providers/perplexity';
import YouChat from '../providers/you';
import PerplexityLlama from '../providers/perplexity-labs.js';
import Phind from '../providers/phind';
import Smol from '../providers/smol';
import Together from '../providers/together';
import Vercel from 'providers/vercel';
import OpenRouter from '../providers/openrouter';
import Poe from 'providers/poe';
import InflectionPi from 'providers/inflection';
import StableChat from 'providers/stablechat';
import Grok from 'providers/grok';
import Deepseek from 'providers/deepseek';
import AIStudio from 'providers/aistudio';

export const allProviders = [
	OpenAi,
	Grok,
	AIStudio,
	Bard,
	Bing,
	Claude,
	Deepseek,
	YouChat,
	Perplexity,
	Phind,
	Poe,
	InflectionPi,
	HuggingChat,
	StableChat,
	OobaBooga,
	Together,
	OpenRouter,
	PerplexityLlama,
	Vercel,
	Smol,
];
