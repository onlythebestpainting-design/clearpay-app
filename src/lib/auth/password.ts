// Password strength validation — runs on client and server
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length < 12) {
    errors.push('At least 12 characters')
  } else {
    score++
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter')
  } else {
    score++
  }

  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter')
  } else {
    score++
  }

  if (!/[0-9]/.test(password)) {
    errors.push('At least one number')
  } else {
    score++
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('At least one special character')
  } else {
    score++
  }

  return { valid: errors.length === 0, errors, score }
}

export function getPasswordStrengthLabel(score: number): string {
  if (score <= 1) return 'Very Weak'
  if (score === 2) return 'Weak'
  if (score === 3) return 'Fair'
  if (score === 4) return 'Strong'
  return 'Very Strong'
}

export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return 'bg-red-500'
  if (score === 2) return 'bg-orange-500'
  if (score === 3) return 'bg-yellow-500'
  if (score === 4) return 'bg-blue-500'
  return 'bg-green-500'
}
