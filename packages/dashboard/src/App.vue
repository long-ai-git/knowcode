<template>
  <div class="knowcode-dashboard">
    <header class="dashboard-header">
      <h1>📚 KnowCode 知识图谱</h1>
      <nav>
        <router-link to="/">知识图谱</router-link>
        <router-link to="/bugs">BUG 记录</router-link>
        <router-link to="/adrs">架构决策</router-link>
        <router-link to="/debts">技术债</router-link>
        <router-link to="/stats">统计</router-link>
      </nav>
    </header>
    <main class="dashboard-main">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f1419;
  color: #e7e9ea;
}

.knowcode-dashboard {
  min-height: 100vh;
}

.dashboard-header {
  background: #1a1f25;
  padding: 16px 24px;
  border-bottom: 1px solid #2f3336;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-header h1 {
  font-size: 20px;
  color: #4a9eff;
}

.dashboard-header nav {
  display: flex;
  gap: 24px;
}

.dashboard-header nav a {
  color: #8b98a5;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.dashboard-header nav a:hover,
.dashboard-header nav a.router-link-active {
  color: #4a9eff;
}

.dashboard-main {
  padding: 24px;
}
</style>