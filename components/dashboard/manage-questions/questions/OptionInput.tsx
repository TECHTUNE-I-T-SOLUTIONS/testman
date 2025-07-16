"use client"

import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Option {
  text: string
  isCorrect: boolean
}

interface OptionInputProps {
  options: Option[]
  setOptions: (options: Option[]) => void
}

export default function OptionInput({ options, setOptions }: OptionInputProps) {
  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, text: string, isCorrect: boolean) => {
    const newOptions = [...options]
    newOptions[index] = { text, isCorrect }
    setOptions(newOptions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Answer Options</CardTitle>
        <CardDescription>Add answer choices and mark the correct one(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`correct-${index}`}
                checked={option.isCorrect}
                onCheckedChange={(checked) => updateOption(index, option.text, checked as boolean)}
              />
              <Label htmlFor={`correct-${index}`} className="text-xs text-muted-foreground">
                Correct
              </Label>
            </div>

            <Input
              value={option.text}
              onChange={(e) => updateOption(index, e.target.value, option.isCorrect)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />

            {options.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeOption(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addOption} className="w-full bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </CardContent>
    </Card>
  )
}
