import React, { useState, useEffect } from 'react';

/**
 * AvailabilityCalendar Component
 * 
 * Interactive calendar widget that displays availability data in a visual grid format.
 * Shows time slots with color-coded availability indicators and allows interaction
 * with specific time periods.
 * 
 * Features:
 * - Week/month view options
 * - Time slot grid display
 * - Hover tooltips with details
 * - Click handling for slot selection
 * - Color-coded availability levels
 */
const AvailabilityCalendar = ({ 
    availabilityData, 
    startDate, 
    endDate, 
    onTimeSlotClick,
    selectedTimeSlot 
}) => {
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [hoveredSlot, setHoveredSlot] = useState(null);

    // Working hours configuration
    const WORK_START_HOUR = 9;
    const WORK_END_HOUR = 17;
    const HOUR_HEIGHT = 60; // pixels per hour
    const SLOT_DURATION = 30; // minutes per slot

    useEffect(() => {
        // Set current week to start of the analysis period
        const start = new Date(startDate);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek;
        const weekStart = new Date(start.setDate(diff));
        setCurrentWeekStart(weekStart);
    }, [startDate]);

    /**
     * Generate time slots for the calendar grid
     */
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
            for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
                slots.push({
                    hour,
                    minute,
                    label: formatTimeSlot(hour, minute)
                });
            }
        }
        return slots;
    };

    /**
     * Generate days for the current view
     */
    const generateDays = () => {
        const days = [];
        const start = new Date(currentWeekStart);
        const daysToShow = viewMode === 'week' ? 7 : 7; // For now, keep it week view
        
        for (let i = 0; i < daysToShow; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    /**
     * Format time slot label
     */
    const formatTimeSlot = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    /**
     * Check if a specific time slot has availability
     */
    const getSlotAvailability = (day, hour, minute) => {
        if (!availabilityData?.common_availability) return null;

        const slotStart = new Date(day);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION);

        // Find overlapping availability slots
        const overlapping = availabilityData.common_availability.filter(slot => {
            const availStart = new Date(slot.start_time);
            const availEnd = new Date(slot.end_time);
            
            return (slotStart < availEnd && slotEnd > availStart);
        });

        if (overlapping.length === 0) return null;

        // Return the slot with most availability
        return overlapping.reduce((best, current) => 
            current.duration_minutes > best.duration_minutes ? current : best
        );
    };

    /**
     * Get CSS class for availability level
     */
    const getAvailabilityClass = (availability) => {
        if (!availability) return 'unavailable';
        
        const duration = availability.duration_minutes;
        if (duration >= 120) return 'high-availability';
        if (duration >= 60) return 'medium-availability';
        return 'low-availability';
    };

    /**
     * Handle time slot click
     */
    const handleSlotClick = (day, hour, minute, availability) => {
        if (!availability || !onTimeSlotClick) return;

        const slotStart = new Date(day);
        slotStart.setHours(hour, minute, 0, 0);
        
        onTimeSlotClick({
            start_time: slotStart.toISOString(),
            day: day.toDateString(),
            time: formatTimeSlot(hour, minute),
            availability
        });
    };

    /**
     * Navigate to previous/next week
     */
    const navigateWeek = (direction) => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + (direction * 7));
        setCurrentWeekStart(newWeekStart);
    };

    /**
     * Check if slot is selected
     */
    const isSlotSelected = (day, hour, minute) => {
        if (!selectedTimeSlot) return false;
        
        const slotStart = new Date(day);
        slotStart.setHours(hour, minute, 0, 0);
        const selectedStart = new Date(selectedTimeSlot.start_time);
        
        return Math.abs(slotStart - selectedStart) < 60000; // Within 1 minute
    };

    const timeSlots = generateTimeSlots();
    const days = generateDays();

    return (
        <div className="availability-calendar">
            {/* Calendar Header */}
            <div className="calendar-nav">
                <button 
                    onClick={() => navigateWeek(-1)}
                    className="nav-button"
                >
                    ← Previous Week
                </button>
                <div className="current-period">
                    {currentWeekStart.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                    })}
                </div>
                <button 
                    onClick={() => navigateWeek(1)}
                    className="nav-button"
                >
                    Next Week →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
                {/* Time Labels Column */}
                <div className="time-column">
                    <div className="time-header"></div>
                    {timeSlots.map((slot, index) => (
                        <div key={index} className="time-label">
                            {slot.label}
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {days.map((day, dayIndex) => (
                    <div key={dayIndex} className="day-column">
                        {/* Day Header */}
                        <div className="day-header">
                            <div className="day-name">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="day-date">
                                {day.getDate()}
                            </div>
                        </div>

                        {/* Time Slots */}
                        {timeSlots.map((slot, slotIndex) => {
                            const availability = getSlotAvailability(day, slot.hour, slot.minute);
                            const isSelected = isSlotSelected(day, slot.hour, slot.minute);
                            const availabilityClass = getAvailabilityClass(availability);

                            return (
                                <div
                                    key={slotIndex}
                                    className={`time-slot ${availabilityClass} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSlotClick(day, slot.hour, slot.minute, availability)}
                                    onMouseEnter={() => setHoveredSlot({
                                        day: day.toDateString(),
                                        time: slot.label,
                                        availability
                                    })}
                                    onMouseLeave={() => setHoveredSlot(null)}
                                >
                                    {availability && (
                                        <div className="availability-indicator">
                                            <span className="duration">
                                                {availability.duration_minutes}m
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
                <h4>Availability Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <div className="legend-color high-availability"></div>
                        <span>2+ hours available</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color medium-availability"></div>
                        <span>1-2 hours available</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color low-availability"></div>
                        <span>30-60 minutes available</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color unavailable"></div>
                        <span>No availability</span>
                    </div>
                </div>
            </div>

            {/* Hover Tooltip */}
            {hoveredSlot && (
                <div className="slot-tooltip">
                    <div className="tooltip-content">
                        <div className="tooltip-day">{hoveredSlot.day}</div>
                        <div className="tooltip-time">{hoveredSlot.time}</div>
                        {hoveredSlot.availability ? (
                            <div className="tooltip-availability">
                                <div>Available: {hoveredSlot.availability.duration_minutes} minutes</div>
                                <div>Members: {hoveredSlot.availability.user_count}</div>
                            </div>
                        ) : (
                            <div className="tooltip-unavailable">No availability</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityCalendar;
