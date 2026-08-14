export interface Plan {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  isCurrent: boolean
  isPopular?: boolean
}

export interface Invoice {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  downloadUrl: string
}
