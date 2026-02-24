import type { CSSProperties } from 'react'

const logoStyle: CSSProperties = {
  display: 'block',
  height: '40px',
  maxWidth: '220px',
  width: 'auto',
}

export default function AdminLogo() {
  return <img alt="IT Skill House" src="https://itskillhouse.com/assets/logo.svg" style={logoStyle} />
}
