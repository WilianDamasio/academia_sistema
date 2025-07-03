// Hook simples para toast usando alert temporariamente
export function useToast() {
  const toast = ({ title, description, variant }) => {
    const message = `${title}: ${description}`
    if (variant === 'destructive') {
      alert(`❌ ${message}`)
    } else {
      alert(`✅ ${message}`)
    }
  }

  return { toast }
}

