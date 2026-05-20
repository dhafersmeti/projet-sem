import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChangePasswordPage({ forced = false }) {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [form, setForm]     = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [show, setShow]     = useState({ old: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.oldPassword) e.oldPassword = "L'ancien mot de passe est requis"
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'Au moins 6 caractères'
    if (form.newPassword !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { data } = await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword })
      toast.success('Mot de passe modifié avec succès !')
      if (data.token) {
        login({ ...user, token: data.token, mustChangePassword: false })
        localStorage.setItem('jwt_token', data.token)
        const saved = JSON.parse(localStorage.getItem('user_info') || '{}')
        localStorage.setItem('user_info', JSON.stringify({ ...saved, mustChangePassword: false }))
      }
      navigate(user?.role === 'CANDIDATE' ? '/portal' : '/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const Field = ({ name, label, showKey }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          className={`input-field pr-10 ${errors[name] ? 'border-red-400' : ''}`}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder="••••••••"
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}>
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {forced && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-amber-800 text-sm font-medium">
              🔐 Première connexion détectée. Veuillez changer votre mot de passe pour continuer.
            </p>
          </div>
        )}
        <div className="card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Changer le mot de passe</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="oldPassword"  label="Ancien mot de passe"   showKey="old" />
            <Field name="newPassword"  label="Nouveau mot de passe"  showKey="new" />
            <Field name="confirm"      label="Confirmer le nouveau"  showKey="confirm" />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
