class ActivatedUserExists(Exception):
    def __init__(self):
        super().__init__("Activated user with given email already exists.")
