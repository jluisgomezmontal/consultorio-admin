#!/usr/bin/env node

/**
 * Script para verificar que la aplicación esté lista para despliegue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    checks.passed.push(`✅ ${description}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description}`);
    return false;
  }
}

function checkEnvExample() {
  const envExamplePath = path.join(__dirname, '.env.example');
  if (checkFile(envExamplePath, '.env.example existe')) {
    const content = fs.readFileSync(envExamplePath, 'utf-8');
    if (content.includes('NEXT_PUBLIC_API_URL')) {
      checks.passed.push('✅ .env.example contiene NEXT_PUBLIC_API_URL');
    } else {
      checks.failed.push('❌ .env.example no contiene NEXT_PUBLIC_API_URL');
    }
  }
}

function checkGitignore() {
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (checkFile(gitignorePath, '.gitignore existe')) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes('.env') || content.includes('.env*')) {
      checks.passed.push('✅ .gitignore incluye archivos .env');
    } else {
      checks.failed.push('❌ .gitignore no incluye archivos .env');
    }
    
    if (content.includes('node_modules')) {
      checks.passed.push('✅ .gitignore incluye node_modules');
    } else {
      checks.failed.push('❌ .gitignore no incluye node_modules');
    }
  }
}

function checkPackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  if (checkFile(packagePath, 'package.json existe')) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    if (pkg.scripts && pkg.scripts.build) {
      checks.passed.push('✅ package.json tiene script "build"');
    } else {
      checks.failed.push('❌ package.json no tiene script "build"');
    }
    
    if (pkg.scripts && pkg.scripts.start) {
      checks.passed.push('✅ package.json tiene script "start"');
    } else {
      checks.failed.push('❌ package.json no tiene script "start"');
    }
  }
}

function checkNextConfig() {
  const nextConfigPath = path.join(__dirname, 'next.config.ts');
  const nextConfigJsPath = path.join(__dirname, 'next.config.js');
  const nextConfigMjsPath = path.join(__dirname, 'next.config.mjs');
  
  if (fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigJsPath) || fs.existsSync(nextConfigMjsPath)) {
    checks.passed.push('✅ next.config existe');
  } else {
    checks.warnings.push('⚠️  next.config no encontrado (puede ser opcional)');
  }
}

function checkVercelJson() {
  const vercelPath = path.join(__dirname, 'vercel.json');
  if (fs.existsSync(vercelPath)) {
    checks.passed.push('✅ vercel.json existe');
  } else {
    checks.warnings.push('⚠️  vercel.json no encontrado (Vercel puede auto-detectar)');
  }
}

console.log('\n🔍 Verificando preparación para despliegue...\n');

// Ejecutar verificaciones
checkFile(path.join(__dirname, 'package.json'), 'package.json existe');
checkPackageJson();
checkGitignore();
checkEnvExample();
checkNextConfig();
checkVercelJson();

// Mostrar resultados
console.log('\n📊 Resultados:\n');

if (checks.passed.length > 0) {
  console.log('✅ PASADAS:');
  checks.passed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:');
  checks.warnings.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FALLIDAS:');
  checks.failed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

// Resumen
const total = checks.passed.length + checks.failed.length + checks.warnings.length;
const score = Math.round((checks.passed.length / (checks.passed.length + checks.failed.length)) * 100);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📈 Score: ${score}% (${checks.passed.length}/${checks.passed.length + checks.failed.length} pasadas)\n`);

if (checks.failed.length === 0) {
  console.log('🎉 ¡Tu aplicación está lista para desplegar!\n');
  console.log('Próximos pasos:');
  console.log('1. Sube tu código a GitHub');
  console.log('2. Conecta tu repositorio a Vercel');
  console.log('3. Configura las variables de entorno');
  console.log('4. ¡Deploy! 🚀\n');
  process.exit(0);
} else {
  console.log('⚠️  Hay algunos problemas que debes resolver antes de desplegar.\n');
  console.log('Revisa los errores arriba y corrígelos.\n');
  process.exit(1);
}
