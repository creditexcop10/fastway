"use client"

import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, Save } from "lucide-react"

export function ProfileForm({ profile }: { profile: any }) {
  const [isSaving, setIsSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    await updateProfile(formData)
    setIsSaving(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input 
          id="full_name" 
          name="full_name" 
          defaultValue={profile?.full_name || ""} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone" 
          type="tel" 
          defaultValue={profile?.phone || ""} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name (Optional)</Label>
        <Input 
          id="company_name" 
          name="company_name" 
          defaultValue={profile?.company_name || ""} 
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