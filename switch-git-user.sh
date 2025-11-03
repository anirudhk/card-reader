#!/bin/bash

# Git User Switcher Script
# Quickly switch between different Git user configurations

echo "🔀 Git User Switcher"
echo "===================="
echo ""

# Check current configuration
echo "Current Git configuration:"
echo "-------------------------"
echo "Global:"
git config --global user.name 2>/dev/null && echo "  Name: $(git config --global user.name)" || echo "  Name: (not set)"
git config --global user.email 2>/dev/null && echo "  Email: $(git config --global user.email)" || echo "  Email: (not set)"
echo ""
echo "Local (this repo):"
git config user.name 2>/dev/null && echo "  Name: $(git config user.name)" || echo "  Name: (not set)"
git config user.email 2>/dev/null && echo "  Email: $(git config user.email)" || echo "  Email: (not set)"
echo ""

# Menu
echo "What would you like to do?"
echo "1) Change global Git user (all repositories)"
echo "2) Change Git user for THIS repository only"
echo "3) Unset local user (use global instead)"
echo "4) Show current configuration"
echo "5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo ""
    echo "Setting GLOBAL Git user (affects all repositories):"
    read -p "Enter your name: " name
    read -p "Enter your email: " email
    git config --global user.name "$name"
    git config --global user.email "$email"
    echo ""
    echo "✅ Global Git user updated!"
    echo "   Name: $(git config --global user.name)"
    echo "   Email: $(git config --global user.email)"
    ;;
  2)
    echo ""
    echo "Setting LOCAL Git user (this repository only):"
    read -p "Enter your name: " name
    read -p "Enter your email: " email
    git config user.name "$name"
    git config user.email "$email"
    echo ""
    echo "✅ Local Git user updated!"
    echo "   Name: $(git config user.name)"
    echo "   Email: $(git config user.email)"
    ;;
  3)
    echo ""
    echo "Removing local Git user configuration..."
    git config --unset user.name
    git config --unset user.email
    echo "✅ Local Git user removed. Will use global settings."
    ;;
  4)
    echo ""
    echo "Current Git configuration:"
    echo "-------------------------"
    echo "Global:"
    git config --global user.name 2>/dev/null && echo "  Name: $(git config --global user.name)" || echo "  Name: (not set)"
    git config --global user.email 2>/dev/null && echo "  Email: $(git config --global user.email)" || echo "  Email: (not set)"
    echo ""
    echo "Local (this repo):"
    git config user.name 2>/dev/null && echo "  Name: $(git config user.name)" || echo "  Name: (not set, using global)"
    git config user.email 2>/dev/null && echo "  Email: $(git config user.email)" || echo "  Email: (not set, using global)"
    ;;
  5)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid choice!"
    exit 1
    ;;
esac

echo ""
echo "Done! 🎉"

