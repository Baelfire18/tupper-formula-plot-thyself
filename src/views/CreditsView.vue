<script setup lang="ts">
import { ref } from 'vue'
import { TONY_LINKEDIN, JOAQUIN_INSTAGRAM, JEFF_PAGE } from '../constants/links'

interface Person {
  name: string
  initials: string
  role: string
  description: string
  photo: string
  link: string
  linkLabel: string
}

const base = import.meta.env.BASE_URL

const people: Person[] = [
  {
    name: 'Jose Antonio (Tony) Castro',
    initials: 'TC',
    role: 'Webpage Creator & Developer',
    description:
      'Software engineer based in Chile. Built this interactive explorer from scratch using Vue 3, TypeScript, and JavaScript BigInt — turning a fascinating mathematical concept into a playground anyone can enjoy.',
    photo: `${base}credits/tony_linkedin.jpeg`,
    link: TONY_LINKEDIN,
    linkLabel: 'LinkedIn',
  },
  {
    name: 'Joaquin Bermejo',
    initials: 'JB',
    role: 'Inspiration',
    description:
      "Digital creator who uploads math reels to Instagram. One of his videos about Tupper's formula was the spark that started this whole project — proving that a short reel can inspire someone to build something.",
    photo: `${base}credits/joaquin_ig.jpg`,
    link: JOAQUIN_INSTAGRAM,
    linkLabel: 'Instagram',
  },
  {
    name: 'Jeff Tupper',
    initials: 'JT',
    role: 'The Mathematician',
    description:
      'Computer scientist and mathematician who presented this self-referential formula at SIGGRAPH 2001 in his paper "Reliable Two-Dimensional Graphing Methods for Mathematically Defined Curves and Surfaces." The paper was actually about reliable graphing methods — the formula that plots itself was just a small side demonstration within it. But that little curiosity ended up becoming far more famous than the paper itself.',
    photo: `${base}credits/jeff.gif`,
    link: JEFF_PAGE,
    linkLabel: 'University Page',
  },
]

const failedImages = ref<Set<number>>(new Set())

function onImgError(index: number) {
  failedImages.value.add(index)
}
</script>

<template>
  <div class="credits">
    <div class="credits-inner">
      <h1>Credits</h1>
      <p class="subtitle">The people behind this project.</p>

      <div
        v-for="(person, i) in people"
        :key="person.name"
        class="person-section"
        :class="{ reversed: i % 2 === 1 }"
      >
        <div class="person-photo">
          <a :href="person.link" target="_blank" rel="noopener">
            <img
              v-if="!failedImages.has(i)"
              :src="person.photo"
              :alt="person.name"
              @error="onImgError(i)"
            />
            <div v-else class="avatar-fallback">{{ person.initials }}</div>
          </a>
        </div>
        <div class="person-text">
          <span class="person-role">{{ person.role }}</span>
          <h2>{{ person.name }}</h2>
          <p>{{ person.description }}</p>
          <a :href="person.link" target="_blank" rel="noopener" class="person-link">
            {{ person.linkLabel }}
            <span class="arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.credits {
  min-height: 80vh;
  padding: 60px 20px 80px;
}

.credits-inner {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 36px;
  font-weight: 800;
  text-align: center;
  margin: 0 0 8px;
}

.subtitle {
  text-align: center;
  color: var(--muted);
  font-size: 16px;
  margin: 0 0 30px;
}

/* Person section */
.person-section {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 40px 0;
}

.person-section:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

.person-section.reversed {
  flex-direction: row-reverse;
}

.person-section.reversed .person-text {
  text-align: right;
}

/* Photo */
.person-photo {
  flex-shrink: 0;
}

.person-photo a {
  display: block;
}

.person-photo img {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.person-photo img:hover,
.person-photo .avatar-fallback:hover {
  border-color: var(--accent);
  transform: scale(1.03);
}

.avatar-fallback {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 3px solid var(--border);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  background: linear-gradient(135deg, rgba(122, 162, 255, 0.2), rgba(122, 162, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 2px;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

/* Text */
.person-text {
  flex: 1;
}

.person-role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(122, 162, 255, 0.12);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.person-text h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px;
}

.person-text p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
  margin: 0 0 20px;
}

.person-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(122, 162, 255, 0.3);
  background: rgba(122, 162, 255, 0.1);
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.person-link:hover {
  background: rgba(122, 162, 255, 0.2);
  border-color: rgba(122, 162, 255, 0.5);
  transform: translateY(-1px);
}

.person-link .arrow {
  transition: transform 0.2s;
}

.person-link:hover .arrow {
  transform: translateX(4px);
}

/* Mobile */
@media (max-width: 700px) {
  .person-section,
  .person-section.reversed {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .person-section.reversed .person-text {
    text-align: center;
  }

  .person-photo img,
  .person-photo .avatar-fallback {
    width: 140px;
    height: 140px;
  }

  .person-photo .avatar-fallback {
    font-size: 36px;
  }
}
</style>
