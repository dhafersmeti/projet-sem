import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function CandidateRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = "L'email est obligatoire"
    if (!form.password) errs.password = 'Le mot de passe est obligatoire'
    else if (form.password.length < 6) errs.password = 'Minimum 6 caractères'
    if (form.password !== form.confirm) errs.confirm = 'Les mots de passe ne correspondent pas'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await authApi.candidateRegister({ email: form.email, password: form.password })
      toast.success('Compte créé ! Vous pouvez maintenant vous connecter.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la création du compte'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">RecrutApp</h1>
          <p className="text-gray-500 mt-1">Espace candidat</p>
        </div>

        <div className="card shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Créer votre compte</h2>
          <p className="text-sm text-gray-500 mb-6">
            Utilisez l'email avec lequel vous avez postulé pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="votre.email@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                className={`input-field ${errors.confirm ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
