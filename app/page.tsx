"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  Search,
  Accessibility,
  Trash2,
  Bell,
  Settings,
  CreditCard,
  RotateCcw,
  Map,
  Star,
  Check,
  Edit3,
  Plus,
  Play,
  AlertTriangle,
  Loader2,
  Home,
  Bookmark,
  RouteIcon,
  Shield,
  List,
} from "lucide-react"

type Page =
  | "home"
  | "plan-trip"
  | "plan-results"
  | "edit-trip"
  | "saved-trips"
  | "active-trip"
  | "ticket-options"
  | "settings"
  | "suggested-trips"
type BottomNavTab = "saved-trips" | "home" | "planner"
type RouteFilter = "cheapest" | "fastest" | "wheelchair"
type SuggestedView = "map" | "tiles"

interface SavedTrip {
  id: string
  name: string
  destination: string
  time: string
  fare: string
  isActive?: boolean
  deleted?: boolean
  deletedAt?: Date
}

interface RouteType {
  id: string
  type: RouteFilter
  eta: string
  fare: string
  transfers: number
  color: string
  accessible: boolean
  departureTime: string
  arrivalTime: string
  delayInfo?: string
}

interface SuggestedLocation {
  id: string
  name: string
  category: "food" | "museum" | "event"
  description: string
  distance: string
  image: string
  rating: number
}

interface AppSettings {
  peacefulMode: boolean
  lowFloorOnly: boolean
  wheelchairSpace: boolean
  vibrationAlerts: boolean
  highContrastMode: boolean
  notifications: {
    arrivals: boolean
    delays: boolean
  }
}

interface Toast {
  id: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  visible: boolean
}

export default function TransitApp() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [activeTab, setActiveTab] = useState<BottomNavTab>("home")
  const [showMenu, setShowMenu] = useState(false)

  // Trip planning state
  const [fromLocation, setFromLocation] = useState("Current location")
  const [toLocation, setToLocation] = useState("")
  const [selectedDate, setSelectedDate] = useState("Now")
  const [selectedTime, setSelectedTime] = useState("Now")
  const [routes, setRoutes] = useState<RouteType[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null)
  const [activeFilter, setActiveFilter] = useState<RouteFilter>("fastest")
  const [isLoading, setIsLoading] = useState(false)

  // Trip editing state
  const [editingTrip, setEditingTrip] = useState<SavedTrip | null>(null)
  const [tripName, setTripName] = useState("")

  // Suggested trips state
  const [suggestedView, setSuggestedView] = useState<SuggestedView>("map")

  // Active trip state
  const [tripProgress, setTripProgress] = useState(0)
  const [eta, setEta] = useState("12 min")

  // Dialogs and modals
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [showLocationDialog, setShowLocationDialog] = useState(false)

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([])

  // Persistent settings
  const [settings, setSettings] = useState<AppSettings>({
    peacefulMode: false,
    lowFloorOnly: false,
    wheelchairSpace: false,
    vibrationAlerts: false,
    highContrastMode: false,
    notifications: {
      arrivals: true,
      delays: true,
    },
  })

  // Saved trips
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([
    {
      id: "1",
      name: "Work Commute",
      destination: "Downtown Office",
      time: "8:30 AM",
      fare: "NZ $4.50",
      isActive: true,
    },
    {
      id: "2",
      name: "Weekend Shopping",
      destination: "Westfield Mall",
      time: "2:00 PM",
      fare: "NZ $3.20",
    },
    {
      id: "3",
      name: "Gym Session",
      destination: "City Fitness Center",
      time: "6:00 PM",
      fare: "NZ $3.80",
    },
    {
      id: "4",
      name: "Doctor Appointment",
      destination: "Medical Center",
      time: "10:30 AM",
      fare: "NZ $2.90",
    },
    {
      id: "5",
      name: "Library Visit",
      destination: "Central Library",
      time: "1:00 PM",
      fare: "NZ $2.50",
    },
    {
      id: "6",
      name: "Coffee with Friends",
      destination: "Cafe Luna",
      time: "3:30 PM",
      fare: "NZ $3.20",
    },
  ])

  // Sample routes data
  const sampleRoutes: RouteType[] = [
    {
      id: "1",
      type: "fastest",
      eta: "23 min",
      fare: "NZ $4.50",
      transfers: 0,
      color: "#1DB954",
      accessible: false,
      departureTime: "2:45 PM",
      arrivalTime: "3:08 PM",
    },
    {
      id: "2",
      type: "cheapest",
      eta: "31 min",
      fare: "NZ $2.50",
      transfers: 1,
      color: "#FF6B35",
      accessible: true,
      departureTime: "2:50 PM",
      arrivalTime: "3:21 PM",
    },
    {
      id: "3",
      type: "wheelchair",
      eta: "28 min",
      fare: "NZ $4.50",
      transfers: 0,
      color: "#4285F4",
      accessible: true,
      departureTime: "2:48 PM",
      arrivalTime: "3:16 PM",
      delayInfo: "2 min delay due to traffic",
    },
  ]

  const suggestedLocations: SuggestedLocation[] = [
    {
      id: "1",
      name: "Te Papa Museum",
      category: "museum",
      description: "National museum with interactive exhibits",
      distance: "1.2 km",
      image: "/placeholder.svg?height=120&width=200",
      rating: 4.6,
    },
    {
      id: "2",
      name: "Cuba Street Cafe",
      category: "food",
      description: "Artisan coffee and local pastries",
      distance: "0.8 km",
      image: "/placeholder.svg?height=120&width=200",
      rating: 4.3,
    },
    {
      id: "3",
      name: "Wellington Night Market",
      category: "event",
      description: "Weekly food and craft market",
      distance: "2.1 km",
      image: "/placeholder.svg?height=120&width=200",
      rating: 4.5,
    },
  ]

  const popularLocations = [
    "Downtown Office",
    "Westfield Mall",
    "City Fitness Center",
    "Medical Center",
    "Central Library",
    "Cafe Luna",
    "Airport",
    "University Campus",
    "Train Station",
    "Shopping District",
  ]

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("transit-app-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const savedTripsData = localStorage.getItem("transit-app-trips")
    if (savedTripsData) {
      setSavedTrips(JSON.parse(savedTripsData))
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem("transit-app-settings", JSON.stringify(newSettings))
  }

  // Save trips to localStorage
  const saveTripsToStorage = (trips: SavedTrip[]) => {
    setSavedTrips(trips)
    localStorage.setItem("transit-app-trips", JSON.stringify(trips))
  }

  // Toast management
  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString()
    const toast: Toast = { id, message, action, visible: true }
    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Navigation functions
  const navigateTo = (page: Page, tab?: BottomNavTab) => {
    setCurrentPage(page)
    if (tab) setActiveTab(tab)
    setShowMenu(false)
  }

  const goBack = () => {
    if (currentPage === "plan-results") {
      setCurrentPage("plan-trip")
    } else if (currentPage === "edit-trip") {
      setCurrentPage("plan-results")
    } else if (currentPage === "ticket-options") {
      setCurrentPage("plan-results")
    } else {
      setCurrentPage("home")
      setActiveTab("home")
    }
  }

  // Trip planning functions
  const searchRoutes = () => {
    if (!toLocation.trim()) {
      showToast("Please enter a destination")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setRoutes(sampleRoutes)
      setCurrentPage("plan-results")
      setIsLoading(false)
    }, 1500)
  }

  const selectRoute = (route: RouteType) => {
    setSelectedRoute(route)
    setCurrentPage("edit-trip")
    setTripName(`Trip to ${toLocation}`)
  }

  const saveTrip = () => {
    if (!selectedRoute || !tripName.trim()) return

    const newTrip: SavedTrip = {
      id: Date.now().toString(),
      name: tripName,
      destination: toLocation,
      time: selectedRoute.departureTime,
      fare: selectedRoute.fare,
    }

    const updatedTrips = [newTrip, ...savedTrips]
    saveTripsToStorage(updatedTrips)

    showToast("Trip saved ✓", {
      label: "Undo",
      onClick: () => {
        saveTripsToStorage(savedTrips)
        showToast("Trip save undone")
      },
    })

    setCurrentPage("home")
    setActiveTab("home")
  }

  const deleteTrip = (id: string) => {
    setItemToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return

    const tripToDelete = savedTrips.find((t) => t.id === itemToDelete)
    if (!tripToDelete) return

    const updatedTrips = savedTrips.map((trip) =>
      trip.id === itemToDelete ? { ...trip, deleted: true, deletedAt: new Date() } : trip,
    )

    saveTripsToStorage(updatedTrips)
    setShowDeleteDialog(false)
    setItemToDelete(null)

    showToast("Trip deleted", {
      label: "Undo",
      onClick: () => {
        const restoredTrips = savedTrips.map((trip) =>
          trip.id === itemToDelete ? { ...trip, deleted: false, deletedAt: undefined } : trip,
        )
        saveTripsToStorage(restoredTrips)
        showToast("Trip restored")
      },
    })
  }

  const restoreTrip = (id: string) => {
    const updatedTrips = savedTrips.map((trip) =>
      trip.id === id ? { ...trip, deleted: false, deletedAt: undefined } : trip,
    )
    saveTripsToStorage(updatedTrips)
    showToast("Trip restored ✓")
  }

  const permanentlyDeleteTrip = (id: string) => {
    const updatedTrips = savedTrips.filter((trip) => trip.id !== id)
    saveTripsToStorage(updatedTrips)
    showToast("Trip permanently deleted")
  }

  const startTrip = (trip: SavedTrip) => {
    const updatedTrips = savedTrips.map((t) =>
      t.id === trip.id ? { ...t, isActive: true } : { ...t, isActive: false },
    )
    saveTripsToStorage(updatedTrips)
    setCurrentPage("active-trip")

    // Simulate trip progress
    setTripProgress(0)
    const interval = setInterval(() => {
      setTripProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 1000)
  }

  const togglePeacefulMode = () => {
    const newSettings = { ...settings, peacefulMode: !settings.peacefulMode }
    saveSettings(newSettings)
    showToast(`Peaceful mode ${newSettings.peacefulMode ? "enabled" : "disabled"}`)
  }

  const updateAccessibilitySetting = (key: keyof AppSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const saveSettingsWithConfirmation = () => {
    setShowSettingsDialog(true)
  }

  const confirmSettingsSave = () => {
    setShowSettingsDialog(false)
    showToast("Settings saved ✓")
  }

  // Apply theme
  const themeClass = settings.highContrastMode
    ? "min-h-screen bg-black text-white"
    : "min-h-screen bg-gray-50 text-black"

  const cardClass = settings.highContrastMode ? "bg-gray-900 border-white text-white" : "bg-white border-gray-200"

  const renderHeader = () => (
    <div
      className={`sticky top-0 z-50 flex items-center justify-between p-4 h-16 ${
        settings.highContrastMode ? "bg-black border-b border-white" : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="w-12">
        {currentPage !== "home" && (
          <Button variant="ghost" size="sm" onClick={goBack} className="h-16 w-16 p-0">
            <ChevronLeft className="h-16 w-16" />
          </Button>
        )}
      </div>

      <div className="text-lg font-bold">
        {currentPage === "home" && "Home"}
        {currentPage === "plan-trip" && "Plan Trip"}
        {currentPage === "plan-results" && "Route Options"}
        {currentPage === "edit-trip" && "Edit Trip"}
        {currentPage === "saved-trips" && "Saved Trips"}
        {currentPage === "active-trip" && "Active Trip"}
        {currentPage === "ticket-options" && "Ticket Options"}
        {currentPage === "settings" && "Settings"}
      </div>

      <Button variant="ghost" size="sm" onClick={() => navigateTo("settings")} className="h-14 w-14 p-0">
        <Settings className="h-14 w-14" />
      </Button>
    </div>
  )

  const renderBottomNav = () => (
    <div
      className={`fixed bottom-0 left-0 right-0 ${settings.highContrastMode ? "bg-black border-t border-white" : "bg-white border-t border-gray-200"}`}
    >
      <div className="max-w-md mx-auto flex">
        <button
          onClick={() => {
            setCurrentPage("saved-trips")
            setActiveTab("saved-trips")
          }}
          className={`flex-1 flex flex-col items-center py-2 h-16 ${
            activeTab === "saved-trips" ? "text-[#1DB954]" : "text-gray-500"
          }`}
        >
          <Bookmark className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Saved Trips</span>
        </button>

        <button
          onClick={() => {
            setCurrentPage("home")
            setActiveTab("home")
          }}
          className={`flex-1 flex flex-col items-center py-2 h-16 ${
            activeTab === "home" ? "text-[#1DB954]" : "text-gray-500"
          }`}
        >
          <Home className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => {
            setCurrentPage("plan-trip")
            setActiveTab("planner")
          }}
          className={`flex-1 flex flex-col items-center py-2 h-16 ${
            activeTab === "planner" ? "text-[#1DB954]" : "text-gray-500"
          }`}
        >
          <RouteIcon className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Planner</span>
        </button>
      </div>
    </div>
  )

  const renderMenu = () => null // Remove the menu since we're directly navigating to settings

  const renderToasts = () => (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`mb-2 p-4 rounded-lg shadow-lg flex items-center justify-between ${
            settings.highContrastMode ? "bg-white text-black" : "bg-gray-900 text-white"
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          {toast.action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.action?.onClick()
                hideToast(toast.id)
              }}
              className="text-[#1DB954] hover:text-[#1DB954] h-8"
            >
              {toast.action.label}
            </Button>
          )}
        </div>
      ))}
    </div>
  )

  const renderHomePage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Plan a Trip CTA */}
      <Card className={`${cardClass} border-[#1DB954]`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Plan a Trip</h3>
              <p className="text-sm text-gray-600">Find the best route to your destination</p>
            </div>
            <Button
              onClick={() => {
                setCurrentPage("plan-trip")
                setActiveTab("planner")
              }}
              className="bg-[#1DB954] hover:bg-[#1DB954]/90 h-11 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Saved Trips */}
      <div>
        <h3 className="text-lg font-bold mb-3">Upcoming Trips</h3>
        {savedTrips
          .filter((trip) => !trip.deleted)
          .map((trip) => (
            <Card key={trip.id} className={`${cardClass} mb-3`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{trip.name}</h4>
                    <p className="text-sm text-gray-600">{trip.destination}</p>
                    <p className="text-sm text-gray-500">
                      {trip.time} • {trip.fare}
                    </p>
                  </div>
                  <Button onClick={() => startTrip(trip)} className="bg-[#1DB954] hover:bg-[#1DB954]/90 h-11 px-4">
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Suggested Trips Link */}
      {/* <Card className={cardClass}>
        <CardContent className="p-4">
          <Button variant="ghost" className="w-full justify-between h-11" onClick={() => navigateTo("suggested-trips")}>
            <span className="font-medium">Suggested Trips</span>
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Button>
        </CardContent>
      </Card> */}
    </div>
  )

  const renderPlanTripPage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Map Placeholder */}
      <div className="h-48 rounded-lg overflow-hidden">
        <img
          src="/wellingtonmap.webp"
          alt="Map of Wellington"
          className="w-full h-full object-cover"
        />
      </div>

      {/* From Location */}
      <div>
        <Label className="text-sm font-medium mb-2 block">From</Label>
        <div className="relative">
          <Input value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="pr-10 h-11" />
          <Edit3 className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* To Location */}
      <div>
        <Label className="text-sm font-medium mb-2 block">To</Label>
        <div className="relative">
          <Input
            placeholder="Enter destination"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="h-11 pr-10"
          />
          <Search 
            className="absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer" 
            onClick={() => setShowLocationDialog(true)}
          />
          {toLocation && !showLocationDialog && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50">
              {popularLocations
                .filter(location => location.toLowerCase().includes(toLocation.toLowerCase()))
                .filter(location => location !== toLocation)
                .map(location => (
                  <button
                    key={location}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setToLocation(location)
                    }}
                  >
                    {location}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Date</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Now">Now</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Tomorrow">Tomorrow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Time</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Now">Now</SelectItem>
              <SelectItem value="8:00 AM">8:00 AM</SelectItem>
              <SelectItem value="12:00 PM">12:00 PM</SelectItem>
              <SelectItem value="5:00 PM">5:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Button */}
      <Button onClick={searchRoutes} disabled={isLoading} className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 h-11">
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="h-5 w-5 mr-2" />
            Search Routes
          </>
        )}
      </Button>
    </div>
  )

  const renderPlanResultsPage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as RouteFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cheapest">Cheapest</TabsTrigger>
          <TabsTrigger value="fastest">Fastest</TabsTrigger>
          <TabsTrigger value="wheelchair">Wheelchair</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Route Cards */}
      <div className="space-y-3">
        {routes.map((route) => (
          <Card
            key={route.id}
            className={`${cardClass} cursor-pointer hover:shadow-md transition-shadow ${
              route.type === activeFilter ? "ring-2 ring-[#1DB954]" : ""
            }`}
            onClick={() => selectRoute(route)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: route.color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">{route.eta}</span>
                    <span className="text-lg font-bold text-[#1DB954]">{route.fare}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{route.transfers} transfers</span>
                    <span>
                      {route.departureTime} - {route.arrivalTime}
                    </span>
                    {route.accessible && <Accessibility className="h-4 w-4" />}
                  </div>
                  {route.delayInfo && (
                    <div className="flex items-center mt-2 text-sm text-orange-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {route.delayInfo}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {routes.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No routes found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )

  const renderEditTripPage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Inline Map */}
      <div className="h-32 rounded-lg overflow-hidden">
        <img
          src="/wellingtonmap.webp"
          alt="Map of Wellington"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Trip Name */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Trip Name</Label>
        <div className="relative">
          <Input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Enter trip name"
            className="pr-10 h-11"
          />
          <Edit3 className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Trip Details */}
      {selectedRoute && (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-lg">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Departure</span>
              <span className="font-medium">{selectedRoute.departureTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Arrival</span>
              <span className="font-medium">{selectedRoute.arrivalTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fare</span>
              <span className="font-medium text-[#1DB954]">{selectedRoute.fare}</span>
            </div>
            {selectedRoute.delayInfo && (
              <div className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Service Alert</p>
                  <p className="text-sm text-orange-700">{selectedRoute.delayInfo}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={saveTrip}
          disabled={!tripName.trim()}
          className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 h-11"
        >
          <Check className="h-5 w-5 mr-2" />
          Save Trip
        </Button>

        {/* <Button variant="outline" className="w-full h-11">
          <Repeat className="h-5 w-5 mr-2" />
          Repeat Trip
        </Button> */}

        <Button
          variant="outline"
          className="w-full h-11 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => deleteTrip(editingTrip?.id || "temp")}
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Delete Trip
        </Button>
      </div>
    </div>
  )

  const renderSavedTripsPage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Now Section */}
      {savedTrips.some((trip) => trip.isActive && !trip.deleted) && (
        <div>
          <h3 className="text-lg font-bold mb-3">Now</h3>
          {savedTrips
            .filter((trip) => trip.isActive && !trip.deleted)
            .map((trip) => (
              <Card key={trip.id} className={`${cardClass} mb-3 border-[#1DB954]`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{trip.name}</h4>
                      <p className="text-sm text-gray-600">{trip.destination}</p>
                      <p className="text-sm text-gray-500">
                        {trip.time} • {trip.fare}
                      </p>
                    </div>
                    <Button
                      onClick={() => setCurrentPage("active-trip")}
                      className="bg-[#1DB954] hover:bg-[#1DB954]/90 h-11 px-4"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* All Trips Section */}
      <div>
        <h3 className="text-lg font-bold mb-3">All Trips</h3>
        {savedTrips
          .filter((trip) => !trip.deleted)
          .map((trip) => (
            <Card key={trip.id} className={`${cardClass} mb-3`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{trip.name}</h4>
                    <p className="text-sm text-gray-600">{trip.destination}</p>
                    <p className="text-sm text-gray-500">
                      {trip.time} • {trip.fare}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => startTrip(trip)} className="bg-[#1DB954] hover:bg-[#1DB954]/90 h-11 px-4">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTrip(trip)
                        setTripName(trip.name)
                        setCurrentPage("edit-trip")
                      }}
                      className="h-11 w-11 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {savedTrips.filter((trip) => !trip.deleted).length === 0 && (
        <div className="text-center py-8">
          <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No saved trips yet</p>
          <Button
            onClick={() => {
              setCurrentPage("plan-trip")
              setActiveTab("planner")
            }}
            className="bg-[#1DB954] hover:bg-[#1DB954]/90"
          >
            Plan Your First Trip
          </Button>
        </div>
      )}
    </div>
  )

  const renderActiveTripPage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Live Map */}
      <div className="h-48 rounded-lg overflow-hidden relative">
        <img
          src="/wellingtonmap.webp"
          alt="Map of Wellington"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-2 shadow">
          <div className="text-sm font-medium">ETA: {eta}</div>
        </div>
      </div>

      {/* Progress */}
      <Card className={cardClass}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Trip Progress</span>
            <span className="text-sm text-gray-600">{tripProgress}%</span>
          </div>
          <Progress value={tripProgress} className="h-2 mb-3" />
          <div className="text-center">
            <div className="text-lg font-bold">
              {tripProgress < 30 ? "Walking to stop" : tripProgress < 80 ? "On Bus 42" : "Almost there!"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peaceful Mode */}
      <Card className={cardClass}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`h-6 w-6 ${settings.peacefulMode ? "text-[#1DB954]" : "text-gray-400"}`} />
              <div>
                <div className="font-medium">Peaceful Mode</div>
                <div className="text-sm text-gray-600">Reduce notifications during trip</div>
              </div>
            </div>
            <Switch checked={settings.peacefulMode} onCheckedChange={togglePeacefulMode} />
          </div>
        </CardContent>
      </Card>

      {/* Service Alert */}
      <Card className={`${cardClass} border-orange-200 bg-orange-50`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
            <div>
              <div className="font-medium text-orange-800">Service Alert</div>
              <div className="text-sm text-orange-700">Minor delays expected due to traffic</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Alerts Button */}
      <Button variant="outline" className="w-full h-11">
        <Bell className="h-5 w-5 mr-2" />
        Set Alerts
      </Button>
    </div>
  )

  const renderSuggestedTripsPage = () => (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Suggested Trips</h3>
        <div className="flex space-x-2">
          <Button
            variant={suggestedView === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setSuggestedView("map")}
            className="h-9"
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
          <Button
            variant={suggestedView === "tiles" ? "default" : "outline"}
            size="sm"
            onClick={() => setSuggestedView("tiles")}
            className="h-9"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {suggestedView === "map" ? (
        <div className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden">
          <img
            src="/wellingtonmap.webp"
            alt="Map of Wellington"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {suggestedLocations.map((location) => (
            <Card
              key={location.id}
              className={`${cardClass} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => {
                setToLocation(location.name)
                setCurrentPage("plan-trip")
                setActiveTab("planner")
              }}
            >
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={location.image || "/placeholder.svg"}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{location.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{location.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        {location.rating}
                      </div>
                      <span>{location.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-[#1DB954]">Plan →</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderTicketOptionsPage = () => (
    <div className="p-4 space-y-6 pb-20">
      <h3 className="text-lg font-bold mb-4">Ticket Options</h3>
      <div className="space-y-4">
        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Single Trip</h4>
                <p className="text-sm text-gray-600">Valid for one journey</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">NZ $4.50</div>
                <Button size="sm" className="mt-2 bg-[#1DB954] hover:bg-[#1DB954]/90">
                  Select
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Day Pass</h4>
                <p className="text-sm text-gray-600">Unlimited travel for 24 hours</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">NZ $9.00</div>
                <Button size="sm" className="mt-2 bg-[#1DB954] hover:bg-[#1DB954]/90">
                  Select
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Weekly Pass</h4>
                <p className="text-sm text-gray-600">Unlimited travel for 7 days</p>
              </div>
              <div className="text-right">
                <div className="font-semibold">NZ $45.00</div>
                <Button size="sm" className="mt-2 bg-[#1DB954] hover:bg-[#1DB954]/90">
                  Select
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSettingsPage = () => (
    <div className="p-4 space-y-6 pb-20">
      {/* Account Section */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">JD</span>
            </div>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-gray-600">john.doe@email.com</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="peaceful-mode">Peaceful Mode</Label>
            <Switch
              id="peaceful-mode"
              checked={settings.peacefulMode}
              onCheckedChange={(checked) => updateAccessibilitySetting("peacefulMode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="arrival-notifications">Arrival notifications</Label>
            <Switch
              id="arrival-notifications"
              checked={settings.notifications.arrivals}
              onCheckedChange={(checked) => {
                const newSettings = {
                  ...settings,
                  notifications: { ...settings.notifications, arrivals: checked },
                }
                saveSettings(newSettings)
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="delay-notifications">Delay notifications</Label>
            <Switch
              id="delay-notifications"
              checked={settings.notifications.delays}
              onCheckedChange={(checked) => {
                const newSettings = {
                  ...settings,
                  notifications: { ...settings.notifications, delays: checked },
                }
                saveSettings(newSettings)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Section */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="low-floor"
              checked={settings.lowFloorOnly}
              onCheckedChange={(checked) => updateAccessibilitySetting("lowFloorOnly", checked as boolean)}
            />
            <Label htmlFor="low-floor">Low-floor buses only</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="wheelchair-space"
              checked={settings.wheelchairSpace}
              onCheckedChange={(checked) => updateAccessibilitySetting("wheelchairSpace", checked as boolean)}
            />
            <Label htmlFor="wheelchair-space">Wheelchair space required</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="vibration-alerts"
              checked={settings.vibrationAlerts}
              onCheckedChange={(checked) => updateAccessibilitySetting("vibrationAlerts", checked as boolean)}
            />
            <Label htmlFor="vibration-alerts">Vibration alerts</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="high-contrast"
              checked={settings.highContrastMode}
              onCheckedChange={(checked) => updateAccessibilitySetting("highContrastMode", checked as boolean)}
            />
            <Label htmlFor="high-contrast">Extra-contrast mode</Label>
          </div>
        </CardContent>
      </Card>

      {/* Recently Deleted */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Recently Deleted</CardTitle>
        </CardHeader>
        <CardContent>
          {savedTrips.filter((trip) => trip.deleted).length === 0 ? (
            <p className="text-sm text-gray-600">No deleted items</p>
          ) : (
            <div className="space-y-3">
              {savedTrips
                .filter((trip) => trip.deleted)
                .map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-600">{trip.name}</div>
                      <div className="text-sm text-gray-500">Deleted</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => restoreTrip(trip.id)}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => permanentlyDeleteTrip(trip.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      <Button onClick={saveSettingsWithConfirmation} className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 h-11">
        Save Changes
      </Button>
    </div>
  )

  return (
    <div className={themeClass}>
      <div className="max-w-md mx-auto relative">
        {renderHeader()}
        {renderMenu()}

        <div className="min-h-screen">
          {currentPage === "home" && renderHomePage()}
          {currentPage === "plan-trip" && renderPlanTripPage()}
          {currentPage === "plan-results" && renderPlanResultsPage()}
          {currentPage === "edit-trip" && renderEditTripPage()}
          {currentPage === "saved-trips" && renderSavedTripsPage()}
          {currentPage === "active-trip" && renderActiveTripPage()}
          {currentPage === "suggested-trips" && renderSuggestedTripsPage()}
          {currentPage === "ticket-options" && renderTicketOptionsPage()}
          {currentPage === "settings" && renderSettingsPage()}
        </div>

        {renderBottomNav()}
        {renderToasts()}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className={cardClass}>
            <DialogHeader>
              <DialogTitle>Delete Trip</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this trip? You can restore it from Recently Deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Confirmation Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className={cardClass}>
            <DialogHeader>
              <DialogTitle>Save Settings</DialogTitle>
              <DialogDescription>Your preferences have been saved successfully.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={confirmSettingsSave} className="w-full">
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Location Selection Dialog */}
        <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
          <DialogContent className={`${cardClass} max-h-[80vh] flex flex-col`}>
            <DialogHeader>
              <DialogTitle>Choose a destination</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {!toLocation.trim() && savedTrips.filter((trip) => !trip.deleted).length > 0 && (
                <>
                  <div className="text-sm font-medium text-gray-600 mb-2">Saved Trips</div>
                  {savedTrips
                    .filter((trip) => !trip.deleted)
                    .slice(0, 3)
                    .map((trip) => (
                      <Button
                        key={trip.id}
                        variant="outline"
                        className="w-full justify-start mb-2"
                        onClick={() => {
                          setToLocation(trip.destination)
                          setShowLocationDialog(false)
                        }}
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        {trip.destination}
                      </Button>
                    ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="text-sm font-medium text-gray-600 mb-2">Popular Destinations</div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                {popularLocations
                  .filter(
                    (location) => toLocation.trim() === "" || location.toLowerCase().includes(toLocation.toLowerCase()),
                  )
                  .map((location) => (
                    <Button
                      key={location}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setToLocation(location)
                        setShowLocationDialog(false)
                      }}
                    >
                      {location}
                    </Button>
                  ))}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="secondary" onClick={() => setShowLocationDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
