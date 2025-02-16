class Controller:
  def __init__(self):
    self.last_x = None
    self.last_y = None
    self.step_x = 5
    self.step_y = 5

  def get_angle(self, center):
    if self.last_x is None or self.last_y is None:
      self.last_x, self.last_y = center
      return 0, 0
    
    dx = center[0] - self.last_x
    dy = center[1] - self.last_y
    
    
    self.last_x, self.last_y = center
    return (dx // abs(dx) if dx != 0 else 0) * self.step_x, (dy // abs(dy) if dy != 0 else 0) * self.step_y
    