import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react"

type CafeLazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "loading" | "src"> & {
  src: string
  rootMargin?: string
}

export function CafeLazyImage({
  src,
  rootMargin = "600px 0px",
  decoding = "async",
  ...imageProps
}: CafeLazyImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const canObserve = typeof IntersectionObserver !== "undefined"
  const [shouldLoad, setShouldLoad] = useState(!canObserve)

  useEffect(() => {
    const image = imageRef.current
    if (!image || !canObserve) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin }
    )
    observer.observe(image)

    return () => observer.disconnect()
  }, [canObserve, rootMargin])

  return (
    <img
      {...imageProps}
      ref={imageRef}
      src={shouldLoad ? src : undefined}
      loading="lazy"
      decoding={decoding}
    />
  )
}
