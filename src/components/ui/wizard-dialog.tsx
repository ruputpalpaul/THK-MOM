import * as React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

export interface WizardStep {
    id: string
    title: string
    description?: string
    component: React.ReactNode
    validation?: () => boolean | Promise<boolean>
}

interface WizardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    steps: WizardStep[]
    onComplete: () => Promise<void> | void
    isSubmitting?: boolean
}

export function WizardDialog({
    open,
    onOpenChange,
    title,
    steps,
    onComplete,
    isSubmitting = false,
}: WizardDialogProps) {
    const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
    const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (open) {
            setCurrentStepIndex(0)
            setCompletedSteps(new Set())
        }
    }, [open])

    const currentStep = steps[currentStepIndex]
    const isLastStep = currentStepIndex === steps.length - 1
    const isFirstStep = currentStepIndex === 0

    const handleNext = async () => {
        if (currentStep.validation) {
            const isValid = await currentStep.validation()
            if (!isValid) return
        }

        setCompletedSteps((prev) => new Set(prev).add(currentStepIndex))

        if (isLastStep) {
            await onComplete()
        } else {
            setCurrentStepIndex((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStepIndex((prev) => prev - 1)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] h-[90vh] flex flex-col p-0 gap-0 sm:max-h-[800px]">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-xl">{title}</DialogTitle>

                    {/* Stepper */}
                    <div className="mt-6 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        <div className="relative z-10 flex justify-between">
                            {steps.map((step, index) => {
                                const isActive = index === currentStepIndex
                                const isCompleted = completedSteps.has(index) || index < currentStepIndex

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors bg-background",
                                                isActive && "border-primary text-primary ring-4 ring-primary/20",
                                                isCompleted && "bg-primary border-primary text-primary-foreground",
                                                !isActive && !isCompleted && "border-muted text-muted-foreground"
                                            )}
                                        >
                                            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-xs font-medium absolute top-10 w-32 text-center transition-colors",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-8">
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                            {currentStep.description && (
                                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                            )}
                        </div>
                        {currentStep.component}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t shrink-0 bg-muted/10">
                    <div className="flex w-full justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isFirstStep || isSubmitting}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <Button onClick={handleNext} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isLastStep ? "Create Work Order" : "Next Step"}
                            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
