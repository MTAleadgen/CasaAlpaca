import { useEffect, useState } from "react"

export function useCarousel(api: any) {
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const handleSelect = () => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    setCount(api.scrollSnapList().length)
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }

  useEffect(() => {
    if (!api) return

    handleSelect()
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)

    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api])

  return {
    current,
    count,
    canScrollPrev,
    canScrollNext
  }
}
