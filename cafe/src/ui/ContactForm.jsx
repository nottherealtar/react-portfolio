import { useState } from 'react'
import { contact } from '../content'

const empty = { name: '', company: '', email: '', project_type: '', message: '' }

export default function ContactForm({ onTalk }) {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function update(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Name is required.'
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'A valid email is required.'
    }
    if (!values.project_type) next.project_type = 'Choose a project type.'
    if (!values.message.trim()) next.message = 'Tell me about the problem.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function onSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setStatus('sent')
    onTalk?.()
  }

  if (status === 'sent') {
    return (
      <div className="success" role="status">
        <p className="kicker">Order received</p>
        <h3 className="h2">{contact.successTitle}</h3>
        <p className="lede">{contact.successMsg}</p>
        <button type="button" className="btn btn-secondary" onClick={() => { setStatus('idle'); setValues(empty) }}>
          {contact.reset}
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="cf-name">Name <span className="req">*</span></label>
        <input id="cf-name" name="name" autoComplete="name" value={values.name} onChange={update} />
        {errors.name ? <span className="field-error">{errors.name}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" autoComplete="organization" value={values.company} onChange={update} />
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email <span className="req">*</span></label>
        <input id="cf-email" name="email" type="email" autoComplete="email" value={values.email} onChange={update} />
        {errors.email ? <span className="field-error">{errors.email}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="cf-type">Type of project <span className="req">*</span></label>
        <select id="cf-type" name="project_type" value={values.project_type} onChange={update}>
          <option value="" disabled>
            Select a category…
          </option>
          {contact.types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.project_type ? <span className="field-error">{errors.project_type}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="cf-message">Tell me about it <span className="req">*</span></label>
        <textarea id="cf-message" name="message" rows="5" value={values.message} onChange={update} />
        {errors.message ? <span className="field-error">{errors.message}</span> : null}
      </div>
      <button type="submit" className="btn btn-primary">
        {contact.submit}
      </button>
      <p className="webgl-note">Preview form — the live site still sends through the production contact flow.</p>
    </form>
  )
}
