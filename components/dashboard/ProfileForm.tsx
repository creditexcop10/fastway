"use client"

import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export function ProfileForm({ profile }: { profile: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [company, setCompany] = useState(profile?.company_name || "")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    
    // manually append in case state hasn't fully synced to form data yet
    formData.set("full_name", fullName)
    formData.set("phone", phone)
    formData.set("company_name", company)

    await updateProfile(formData)
    toast.success("Profile updated successfully!")
    setIsSaving(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input 
          id="full_name" 
          name="full_name" 
          required 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone" 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name (Optional)</Label>
        <Input 
          id="company_name" 
          name="company_name" 
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" /> Save Changes
          </>
        )}
      </Button>
    </form>
  )
}