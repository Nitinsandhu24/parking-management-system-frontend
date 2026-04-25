import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export const formatDate = (date, fmt = 'DD MMM YYYY, hh:mm A') =>
  date ? dayjs(date).format(fmt) : '—'

export const fromNow = (date) =>
  date ? dayjs(date).fromNow() : '—'

export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '—'
  const mins = dayjs(endTime).diff(dayjs(startTime), 'minute')
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
