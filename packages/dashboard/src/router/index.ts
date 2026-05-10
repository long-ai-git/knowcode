import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeGraph from '../views/KnowledgeGraph.vue'
import BugList from '../views/BugList.vue'
import AdrList from '../views/AdrList.vue'
import DebtList from '../views/DebtList.vue'
import Stats from '../views/Stats.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'graph', component: KnowledgeGraph },
    { path: '/bugs', name: 'bugs', component: BugList },
    { path: '/adrs', name: 'adrs', component: AdrList },
    { path: '/debts', name: 'debts', component: DebtList },
    { path: '/stats', name: 'stats', component: Stats },
  ],
})

export default router