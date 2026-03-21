"use client"

import * as React from "react"

import collocations from "../../content/collocations.json"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@juan/ui/components/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@juan/ui/components/ui/input-group"

interface Collocation {
  label: string
}

interface MatchSegment {
  text: string
  highlighted: boolean
}

function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

function normalize(value: string) {
  return value.toLowerCase().trim()
}

function getWordMatches(label: string, query: string) {
  const words = label.split(/\s+/)
  const normalizedWords = words.map(normalize)
  const tokens = query.split(/\s+/).map(normalize).filter(Boolean)

  if (tokens.length === 0) {
    return {
      matches: true,
      matchedWordIndexes: new Map<number, string>(),
    }
  }

  const matchedWordIndexes = new Map<number, string>()
  let wordIndex = 0

  for (const token of tokens) {
    let found = false

    while (wordIndex < normalizedWords.length) {
      if (normalizedWords[wordIndex].includes(token)) {
        matchedWordIndexes.set(wordIndex, token)
        wordIndex += 1
        found = true
        break
      }

      wordIndex += 1
    }

    if (!found) {
      return {
        matches: false,
        matchedWordIndexes: new Map<number, string>(),
      }
    }
  }

  return { matches: true, matchedWordIndexes }
}

function getHighlightedSegments(word: string, token?: string): MatchSegment[] {
  if (!token) {
    return [{ text: word, highlighted: false }]
  }

  const normalizedWord = normalize(word)
  const start = normalizedWord.indexOf(token)

  if (start === -1) {
    return [{ text: word, highlighted: false }]
  }

  const end = start + token.length
  const segments: MatchSegment[] = []

  if (start > 0) {
    segments.push({ text: word.slice(0, start), highlighted: false })
  }

  segments.push({ text: word.slice(start, end), highlighted: true })

  if (end < word.length) {
    segments.push({ text: word.slice(end), highlighted: false })
  }

  return segments
}

export function CollocationsSearchBar() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const filteredCollocations = React.useMemo(() => {
    return (collocations as Collocation[])
      .map((collocation) => {
        const result = getWordMatches(collocation.label, query)

        return {
          ...collocation,
          ...result,
        }
      })
      .filter((collocation) => collocation.matches)
  }, [query])

  return (
    <>
      <InputGroup className="h-10 max-w-xl bg-background">
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          readOnly
          role="button"
          aria-label="Open collocations search"
          placeholder="Search collocations..."
          onClick={() => setOpen(true)}
        />
        <InputGroupAddon align="inline-end">
          <kbd className="border-border bg-muted rounded-none border px-1.5 py-0.5 text-[10px]">
            Cmd+K
          </kbd>
        </InputGroupAddon>
        <InputGroupButton
          size="icon-xs"
          className="mr-1"
          aria-label="Open collocations search"
          onClick={() => setOpen(true)}
        >
          <SearchIcon />
        </InputGroupButton>
      </InputGroup>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search collocations"
        description="Search available collocations."
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Type a collocation..."
          />
          <CommandList>
            <CommandEmpty>No collocations found.</CommandEmpty>
            <CommandGroup heading="Collocations">
              {filteredCollocations.map((collocation) => (
                <CommandItem
                  key={collocation.label}
                  value={collocation.label}
                  onSelect={() => {
                    window.location.href = `/${slugify(collocation.label)}`
                  }}
                >
                  <span className="flex flex-wrap gap-x-1">
                    {collocation.label.split(/\s+/).map((word, index) => (
                      <span key={`${collocation.label}-${index}`}>
                        {getHighlightedSegments(
                          word,
                          collocation.matchedWordIndexes.get(index)
                        ).map((segment, segmentIndex) =>
                          segment.highlighted ? (
                            <strong
                              key={`${collocation.label}-${index}-${segmentIndex}`}
                              className="font-semibold"
                            >
                              {segment.text}
                            </strong>
                          ) : (
                            <React.Fragment
                              key={`${collocation.label}-${index}-${segmentIndex}`}
                            >
                              {segment.text}
                            </React.Fragment>
                          )
                        )}
                      </span>
                    ))}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
